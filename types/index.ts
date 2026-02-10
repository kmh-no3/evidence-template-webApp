export type ColumnDefinition = {
  key: string;
  label: string;
  sheet: "test_items" | "evidence_log";
  category: "MUST" | "RECOMMENDED" | "OPTIONAL";
  type: "text" | "date" | "enum" | "number" | "url";
  default_on: boolean;
  help: string;
  enum?: string[];
  sap_hint?: {
    img_path?: string;
    tcode?: string;
    table?: string;
    examples?: string;
  };
};

export type ColumnDefinitions = {
  [key: string]: ColumnDefinition;
};

export type ProfileLevel = {
  description: string;
  default_on_keys: string[];
};

export type Profile = {
  id: string;
  name: string;
  domain: "SAP" | "Development" | "Infra" | "Security" | "Generic";
  description: string;
  levels: {
    lite: ProfileLevel;
    full: ProfileLevel;
  };
  columns: string[];
  evidence_columns: string[];
};

export type GenerateOptions = {
  profile_id: string;
  level: "lite" | "full";
  format: "xlsx" | "csv";
  selected_keys: string[];
  include_sample: boolean;
  csv_sheet?: "test_items" | "evidence_log";
};

export type UserPreferences = {
  profile_id?: string;
  level?: "lite" | "full";
  format?: "xlsx" | "csv";
  include_sample?: boolean;
  csv_sheet?: "test_items" | "evidence_log";
  selected_columns?: {
    [profileId: string]: {
      [level: string]: string[];
    };
  };
};

export type SheetData = {
  sheetName: string;
  columns: ColumnDefinition[];
  sampleRows?: Record<string, string>[];
};
