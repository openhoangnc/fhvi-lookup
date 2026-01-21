import React from "react";
import type { Hospital } from "../types/hospital";
import { translateCategory, t, type Language } from "../utils/translations";
import { MapPin, Phone, ChevronRight, Clock } from "lucide-react";
import { isOpenAt } from "../utils/filter";

interface HospitalCardProps {
  hospital: Hospital & { distance?: number };
  onClick: (hospital: Hospital) => void;
  language: Language;
}

const formatWorkHours = (hospital: Hospital, language: Language) => {
  if (!hospital.workHours || hospital.workHours.length === 0) return null;

  const dayNames = [
    t("monShort", language),
    t("tueShort", language),
    t("wedShort", language),
    t("thuShort", language),
    t("friShort", language),
    t("satShort", language),
    t("sunShort", language),
  ];

  // Try to find if it's open every day with same hours
  if (
    hospital.workHours.length === 1 &&
    hospital.workHours[0].days.length === 7
  ) {
    const wh = hospital.workHours[0];
    return `${t("daily", language)}: ${wh.operationHours
      .map((oh) => {
        const start = new Date(oh.startTime);
        const end = new Date(oh.endTime);
        return `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")} - ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
      })
      .join(", ")}`;
  }

  return hospital.workHours
    .map((wh) => {
      const days = wh.days.map((d) => dayNames[d]).join(", ");
      const hours = wh.operationHours
        .map((oh) => {
          const start = new Date(oh.startTime);
          const end = new Date(oh.endTime);
          return `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")} - ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
        })
        .join(", ");
      return `${days}: ${hours}`;
    })
    .join(" | ");
};

const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onClick,
  language,
}) => {
  const isCurrentlyOpen = isOpenAt(hospital);
  const workHoursText = formatWorkHours(hospital, language);

  return (
    <div className="card" onClick={() => onClick(hospital)}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            className="sf-bold compact-text"
            style={{ fontSize: "17px", marginBottom: "4px" }}
          >
            {language === "en"
              ? hospital.engName || hospital.name
              : hospital.name}
          </div>
          <div
            className="sf-medium"
            style={{
              fontSize: "13px",
              color: "var(--system-blue)",
              marginBottom: "8px",
            }}
          >
            {translateCategory(hospital.category, language)}
          </div>

          {(() => {
            const services = Array.isArray(hospital.services)
              ? hospital.services
              : [];
            const appliedDetails = Array.isArray(
              hospital.appliedBenefitServiceDetails,
            )
              ? hospital.appliedBenefitServiceDetails
              : [];

            const allServices = Array.from(
              new Map(
                [...services, ...appliedDetails].map((s) => [s.id, s]),
              ).values(),
            );

            if (allServices.length === 0) return null;
            return (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                  marginBottom: "8px",
                }}
              >
                {allServices.slice(0, 5).map((service) => (
                  <span
                    key={service.id}
                    style={{
                      backgroundColor: "var(--secondary-background)",
                      color: "var(--label-secondary)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    {language === "en"
                      ? service.name || service.localName
                      : service.localName || service.name}
                  </span>
                ))}
                {allServices.length > 5 && (
                  <span
                    style={{
                      color: "var(--label-tertiary)",
                      fontSize: "11px",
                      padding: "2px 0",
                    }}
                  >
                    +{allServices.length - 5}
                  </span>
                )}
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                color: "var(--label-secondary)",
              }}
            >
              <MapPin size={14} />
              <span className="compact-text">
                {[
                  language === "en"
                    ? hospital.engAddress || hospital.address
                    : hospital.address,
                  language === "en"
                    ? hospital.engDistrict || hospital.district
                    : hospital.district,
                  language === "en"
                    ? hospital.engCity || hospital.city
                    : hospital.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>

            {hospital.distance !== undefined && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  color: "var(--system-blue)",
                  fontWeight: 600,
                }}
              >
                <MapPin size={14} />
                <span className="compact-text">
                  {t("distanceAway", language)} {hospital.distance.toFixed(1)}{" "}
                  km
                </span>
              </div>
            )}

            {workHoursText && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "var(--label-secondary)",
                }}
              >
                <Clock size={14} />
                <span className="compact-text" style={{ flex: 1 }}>
                  <span
                    style={{
                      color: isCurrentlyOpen
                        ? "var(--system-green)"
                        : "var(--system-red)",
                      fontWeight: 600,
                      marginRight: "6px",
                    }}
                  >
                    {isCurrentlyOpen
                      ? t("openNow", language)
                      : t("closed", language)}
                  </span>
                  {workHoursText}
                </span>
              </div>
            )}

            {hospital.phoneNumber && hospital.phoneNumber.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  color: "var(--label-secondary)",
                }}
              >
                <Phone size={14} />
                <span>{hospital.phoneNumber[0]}</span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight
          size={20}
          color="var(--separator)"
          style={{ marginTop: "4px" }}
        />
      </div>
    </div>
  );
};

export default HospitalCard;
