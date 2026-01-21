export interface Service {
  id: number;
  name: string;
  localName: string;
  remark: string | null;
}

export interface Geo {
  latitude: number;
  longitude: number;
}

export interface OperationHour {
  startTime: string;
  endTime: string;
}

export interface WorkHour {
  days: number[];
  isSpecificTime: boolean;
  operationHours: OperationHour[];
  id: string;
}

export interface ProviderBank {
  id: string | null;
  accountName: string;
  accountNumber: string;
  remark: string | null;
  default: boolean;
  bankId: string;
  bankName: string;
}

export interface ListRemark {
  type: string;
  remarkContent: string;
  remarkEngContent: string;
}

export interface Hospital {
  id: string;
  lisaCode: string;
  name: string;
  engName: string;
  category: string;
  services: Service[];
  providerType: string;
  website: string;
  phoneNumber: string[];
  address: string;
  engAddress: string;
  city: string;
  district: string;
  country: string;
  geo: Geo;
  workHours: WorkHour[];
  isSTP: boolean;
  fHVINetwork: boolean;
  preferredClinic: string;
  active: boolean;
  countryName: string;
  countryEngName?: string;
  countryCode: string;
  temporaryDeposit: boolean;
  providerBanks: ProviderBank[];
  listRemark: ListRemark[];
  engDistrict: string;
  engCity: string;
  appliedBenefitServiceDetails?: Service[];
}

export interface HospitalData {
  total: number;
  data: Hospital[];
}
