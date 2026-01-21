import React, { useState, useMemo } from "react";
import rawData from "./data/fhvi.json";
import type { Hospital, HospitalData } from "./types/hospital";
import HospitalCard from "./components/HospitalCard";
import ScrollToTopButton from "./components/ScrollToTopButton";
import {
  searchHospitals,
  filterHospitals,
  calculateDistance,
} from "./utils/filter";
import { t, translateCategory, type Language } from "./utils/translations";
import { Search, X, Info, Sun, Moon, RotateCcw } from "lucide-react";
import "./App.css";

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");
  const [selectedWorkDay, setSelectedWorkDay] = useState<number | "">("");
  const [selectedWorkHour, setSelectedWorkHour] = useState<number | "">("");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null,
  );
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light",
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedMaxDistance, setSelectedMaxDistance] = useState<number | "">(
    "",
  );
  const [language, setLanguage] = useState<Language>("vi");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "vi" ? "en" : "vi"));
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Reset selection if location denied/error
          setSelectedMaxDistance("");
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("");
    setSelectedCity("");
    setSelectedDistrict("");
    setSelectedCategory("");
    setSelectedServiceId("");
    setSelectedWorkDay("");
    setSelectedWorkHour("");
    setSelectedMaxDistance("");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCountry !== "" ||
    selectedCity !== "" ||
    selectedDistrict !== "" ||
    selectedCategory !== "" ||
    selectedServiceId !== "" ||
    selectedWorkDay !== "" ||
    selectedWorkHour !== "" ||
    selectedMaxDistance !== "";

  const allHospitals = useMemo(() => (rawData as HospitalData).data, []);

  const countries = useMemo(() => {
    const unique = new Set<string>();
    const result: { value: string; labelVi: string; labelEn: string }[] = [];

    allHospitals.forEach((h) => {
      if (h.country && !unique.has(h.country)) {
        unique.add(h.country);
        // Capitalize
        const val = h.country.charAt(0).toUpperCase() + h.country.slice(1);
        result.push({
          value: h.country,
          labelVi: val,
          labelEn: h.countryEngName
            ? h.countryEngName.charAt(0).toUpperCase() +
              h.countryEngName.slice(1)
            : val,
        });
      }
    });
    return result.sort((a, b) => a.labelVi.localeCompare(b.labelVi));
  }, [allHospitals]);

  const cities = useMemo(() => {
    const filtered = selectedCountry
      ? allHospitals.filter(
          (h) =>
            (h.country || "").toLowerCase() === selectedCountry.toLowerCase(),
        )
      : allHospitals;

    const unique = new Set<string>();
    const result: { value: string; labelVi: string; labelEn: string }[] = [];

    filtered.forEach((h) => {
      if (h.city && !unique.has(h.city)) {
        unique.add(h.city);
        result.push({
          value: h.city,
          labelVi: h.city,
          labelEn: h.engCity || h.city,
        });
      }
    });
    return result.sort((a, b) => a.labelVi.localeCompare(b.labelVi));
  }, [allHospitals, selectedCountry]);

  const districts = useMemo(() => {
    const filtered = selectedCity
      ? allHospitals.filter((h) => h.city === selectedCity)
      : [];

    const unique = new Set<string>();
    const result: { value: string; labelVi: string; labelEn: string }[] = [];

    filtered.forEach((h) => {
      if (h.district && !unique.has(h.district)) {
        unique.add(h.district);
        result.push({
          value: h.district,
          labelVi: h.district,
          labelEn: h.engDistrict || h.district,
        });
      }
    });

    return result.sort((a, b) => a.labelVi.localeCompare(b.labelVi));
  }, [allHospitals, selectedCity]);

  const categories = useMemo(
    () => Array.from(new Set(allHospitals.map((h) => h.category))).sort(),
    [allHospitals],
  );
  const services = useMemo(() => {
    const serviceMap = new Map<number, { nameVi: string; nameEn: string }>();
    allHospitals.forEach((h) => {
      const allS = [
        ...(h.services || []),
        ...(h.appliedBenefitServiceDetails || []),
      ];
      allS.forEach((s) => {
        if (s.id) {
          serviceMap.set(s.id, {
            nameVi: s.localName || s.name || "",
            nameEn: s.name || s.localName || "",
          });
        }
      });
    });
    return Array.from(serviceMap.entries())
      .map(([id, names]) => ({ id, ...names }))
      .sort((a, b) => a.nameVi.localeCompare(b.nameVi, "vi"));
  }, [allHospitals]);

  const filteredHospitals = useMemo(() => {
    let result = searchHospitals(allHospitals, searchQuery);
    result = filterHospitals(result, {
      country: selectedCountry || undefined,
      city: selectedCity || undefined,
      district: selectedDistrict || undefined,
      category: selectedCategory || undefined,
      serviceId: selectedServiceId || undefined,
      workDay: selectedWorkDay !== "" ? selectedWorkDay : undefined,
      workHour: selectedWorkHour !== "" ? selectedWorkHour : undefined,
      userLocation: userLocation || undefined,
      maxDistance:
        selectedMaxDistance !== "" ? Number(selectedMaxDistance) : undefined,
    });

    let withDistance = result.map((h) => {
      if (
        userLocation &&
        h.geo &&
        h.geo.latitude &&
        h.geo.latitude !== 0 &&
        h.geo.longitude &&
        h.geo.longitude !== 0
      ) {
        return {
          ...h,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            h.geo.latitude,
            h.geo.longitude,
          ),
        };
      }
      return h;
    });

    if (userLocation) {
      withDistance.sort((a: any, b: any) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return 0;
      });
    }

    return withDistance;
  }, [
    allHospitals,
    searchQuery,
    selectedCountry,
    selectedCity,
    selectedDistrict,
    selectedCategory,
    selectedServiceId,
    selectedWorkDay,
    selectedWorkHour,
    userLocation,
    selectedMaxDistance,
  ]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="glass sticky-header">
        <div className="header-content">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/favicon.png"
              alt="Logo"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <h1 className="sf-bold" style={{ fontSize: "24px", margin: 0 }}>
              {t("appTitle", language)}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="icon-button"
              onClick={toggleLanguage}
              style={{ fontSize: "14px", fontWeight: 600, width: "36px" }}
            >
              {language === "vi" ? "EN" : "VN"}
            </button>
            <button className="icon-button" onClick={toggleTheme}>
              {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div className="filter-section">
        <div className="search-container">
          <div className="search-bar">
            <Search size={18} color="var(--label-secondary)" />
            <input
              type="text"
              placeholder={t("searchPlaceholder", language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="clear-button"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="header-filters">
          <div className="filter-select-wrapper">
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedCity("");
                setSelectedDistrict("");
              }}
              className="header-select"
            >
              <option value="">{t("allCountries", language)}</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {language === "vi" ? country.labelVi : country.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict("");
              }}
              className="header-select"
            >
              <option value="">{t("allCities", language)}</option>
              {cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {language === "vi" ? city.labelVi : city.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="header-select"
              disabled={!selectedCity}
            >
              <option value="">{t("allDistricts", language)}</option>
              {districts.map((district) => (
                <option key={district.value} value={district.value}>
                  {language === "vi" ? district.labelVi : district.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="header-select"
            >
              <option value="">{t("allCategories", language)}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {translateCategory(cat, language)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={selectedServiceId}
              onChange={(e) =>
                setSelectedServiceId(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className="header-select"
            >
              <option value="">{t("allServices", language)}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {language === "vi" ? service.nameVi : service.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper work-hours-filter">
            <select
              value={selectedWorkDay}
              onChange={(e) =>
                setSelectedWorkDay(
                  e.target.value !== "" ? Number(e.target.value) : "",
                )
              }
              className="header-select"
            >
              <option value="">{t("allDays", language)}</option>
              <option value="0">{t("mon", language)}</option>
              <option value="1">{t("tue", language)}</option>
              <option value="2">{t("wed", language)}</option>
              <option value="3">{t("thu", language)}</option>
              <option value="4">{t("fri", language)}</option>
              <option value="5">{t("sat", language)}</option>
              <option value="6">{t("sun", language)}</option>
            </select>
          </div>

          <div className="filter-select-wrapper work-hours-filter">
            <select
              value={selectedWorkHour}
              onChange={(e) =>
                setSelectedWorkHour(
                  e.target.value !== "" ? Number(e.target.value) : "",
                )
              }
              className="header-select"
            >
              <option value="">{t("allHours", language)}</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper distance-filter">
            <select
              value={selectedMaxDistance}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const numVal = Number(val);
                  setSelectedMaxDistance(numVal);
                  if (!userLocation) {
                    requestLocation();
                  }
                } else {
                  setSelectedMaxDistance("");
                }
              }}
              className="header-select"
            >
              <option value="">{t("distance", language)}</option>
              <option value="2">{t("under2km", language)}</option>
              <option value="5">{t("under5km", language)}</option>
              <option value="10">{t("under10km", language)}</option>
              <option value="20">{t("under20km", language)}</option>
              <option value="50">{t("under50km", language)}</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="header-select"
              style={{
                flex: "0 0 auto",
                width: "auto",
                minWidth: "auto",
                backgroundImage: "none",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: "center",
                color: "var(--system-blue)",
              }}
              title={t("clearFilters", language)}
            >
              <RotateCcw size={14} />
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                {t("clearFilters", language)}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="content">
        <div
          className="stats"
          style={{
            color: "var(--label-secondary)",
            fontSize: "13px",
            padding: "0 16px",
            marginBottom: "12px",
          }}
        >
          {filteredHospitals.length} {t("providersFound", language)}
        </div>

        <div className="hospital-list">
          {filteredHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onClick={setSelectedHospital}
              language={language}
            />
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedHospital && (
        <div className="overlay" onClick={() => setSelectedHospital(null)}>
          <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header glass">
              <button
                onClick={() => setSelectedHospital(null)}
                className="icon-button"
              >
                <X size={24} />
              </button>
              <span className="sf-bold">{t("details", language)}</span>
              <div style={{ width: 44 }}></div>
            </div>

            <div className="detail-content">
              <h2 className="sf-bold" style={{ marginBottom: 4 }}>
                {language === "en"
                  ? selectedHospital.engName || selectedHospital.name
                  : selectedHospital.name}
              </h2>
              {language === "vi" && selectedHospital.engName && (
                <p style={{ color: "var(--system-blue)", margin: 0 }}>
                  {selectedHospital.engName}
                </p>
              )}
              {language === "en" && (
                <p style={{ color: "var(--system-blue)", margin: 0 }}>
                  {selectedHospital.name}
                </p>
              )}
              <div style={{ height: 16 }}></div>

              {/* Category & Provider Type */}
              <section>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "8px",
                  }}
                >
                  <span className="badge purple">
                    {translateCategory(selectedHospital.category, language)}
                  </span>
                  <span
                    className={`badge ${selectedHospital.providerType === "PRIVATE" ? "orange" : "teal"}`}
                  >
                    {selectedHospital.providerType === "PRIVATE"
                      ? t("private", language)
                      : t("public", language)}
                  </span>
                </div>
              </section>

              {/* Services */}
              {(() => {
                const services = Array.isArray(selectedHospital.services)
                  ? selectedHospital.services
                  : [];
                const appliedDetails = Array.isArray(
                  selectedHospital.appliedBenefitServiceDetails,
                )
                  ? selectedHospital.appliedBenefitServiceDetails
                  : [];

                const allServices = Array.from(
                  new Map(
                    [...services, ...appliedDetails].map((s) => [s.id, s]),
                  ).values(),
                );

                if (allServices.length === 0) return null;

                return (
                  <section>
                    <h3>{t("services", language)}</h3>
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      {allServices.map((service) => (
                        <span key={service.id} className="badge indigo">
                          {language === "en"
                            ? service.name || service.localName
                            : service.localName || service.name}
                        </span>
                      ))}
                    </div>
                  </section>
                );
              })()}

              {/* Work Hours */}
              {selectedHospital.workHours &&
                selectedHospital.workHours.length > 0 && (
                  <section>
                    <h3>{t("workingHours", language)}</h3>
                    {selectedHospital.workHours.map((wh, idx) => {
                      const dayNames = [
                        t("monShort", language),
                        t("tueShort", language),
                        t("wedShort", language),
                        t("thuShort", language),
                        t("friShort", language),
                        t("satShort", language),
                        t("sunShort", language),
                      ];
                      const days = wh.days.map((d) => dayNames[d]).join(", ");
                      const hours = wh.operationHours
                        .map((oh) => {
                          const start = new Date(oh.startTime);
                          const end = new Date(oh.endTime);
                          return `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")} - ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
                        })
                        .join(", ");
                      return (
                        <p
                          key={idx}
                          style={{
                            fontSize: "13px",
                            margin: "4px 0",
                            color: "var(--label-secondary)",
                          }}
                        >
                          <strong>{days}:</strong> {hours}
                        </p>
                      );
                    })}
                  </section>
                )}

              {/* Location */}
              <section>
                <h3>{t("location", language)}</h3>
                <p>
                  {language === "en"
                    ? selectedHospital.engAddress || selectedHospital.address
                    : selectedHospital.address}
                </p>
                <p>
                  {[
                    language === "en"
                      ? selectedHospital.engDistrict ||
                        selectedHospital.district
                      : selectedHospital.district,
                    language === "en"
                      ? selectedHospital.engCity || selectedHospital.city
                      : selectedHospital.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {selectedHospital.geo &&
                  selectedHospital.geo.latitude !== 0 &&
                  selectedHospital.geo.longitude !== 0 && (
                    <a
                      href={`https://www.google.com/maps/search/?q=${selectedHospital.name}, ${selectedHospital.address}, ${selectedHospital.district}, ${selectedHospital.city}, ${selectedHospital.countryName}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "8px",
                        padding: "8px 12px",
                        background: "var(--system-blue)",
                        color: "white",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "13px",
                      }}
                    >
                      📍 {t("viewOnMap", language)}
                    </a>
                  )}
              </section>

              {/* Contact */}
              <section>
                <h3>{t("contact", language)}</h3>
                {selectedHospital.phoneNumber.map((p) => (
                  <a
                    key={p}
                    href={`tel:${p.replace(/[^0-9]/g, "")}`}
                    style={{
                      display: "block",
                      color: "var(--system-blue)",
                      textDecoration: "none",
                      marginBottom: "4px",
                    }}
                  >
                    📞 {p}
                  </a>
                ))}
                {selectedHospital.website && (
                  <a
                    href={
                      selectedHospital.website.startsWith("http")
                        ? selectedHospital.website
                        : `https://${selectedHospital.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      color: "var(--system-blue)",
                      textDecoration: "none",
                      marginTop: "4px",
                    }}
                  >
                    🌐 {selectedHospital.website}
                  </a>
                )}
              </section>

              {/* Network Status */}
              <section>
                <h3>{t("networkInfo", language)}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <span
                    className={`badge ${selectedHospital.fHVINetwork ? "green" : "gray"}`}
                  >
                    {selectedHospital.fHVINetwork
                      ? t("activePrefix", language)
                      : t("inactivePrefix", language)}
                    {t("fhviNetwork", language)}
                  </span>
                  <span
                    className={`badge ${selectedHospital.active ? "blue" : "red"}`}
                  >
                    {selectedHospital.active
                      ? t("activePrefix", language) + t("active", language)
                      : t("inactivePrefix", language) + t("inactive", language)}
                  </span>
                </div>

                {/* Additional Status Info */}
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "var(--label-secondary)",
                  }}
                >
                  {selectedHospital.temporaryDeposit && (
                    <p
                      style={{
                        margin: "4px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      💰 <span>{t("depositRequired", language)}</span>
                    </p>
                  )}
                </div>
              </section>

              {selectedHospital.listRemark &&
                selectedHospital.listRemark.length > 0 && (
                  <section className="remark-box">
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <Info size={18} color="var(--system-blue)" />
                      <span className="sf-bold" style={{ fontSize: "14px" }}>
                        {t("remarks", language)}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", margin: 0, lineHeight: 1.4 }}>
                      {language === "en" &&
                      selectedHospital.listRemark[0].remarkEngContent
                        ? selectedHospital.listRemark[0].remarkEngContent
                        : selectedHospital.listRemark[0].remarkContent}
                    </p>
                  </section>
                )}
            </div>
          </div>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
};

export default App;
