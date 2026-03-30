export const EDITOR_ROLES = ["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR"];
export const CREATOR_ROLES = ["JOURNALIST", "SENIOR_JOURNALIST", "CONTRIBUTOR"];
export const ADMIN_ROLES = ["SUPER_ADMIN"];
export const MANAGEMENT_ROLES = ["SUPER_ADMIN", "CHIEF_EDITOR"];
export const ALL_ROLES = [...EDITOR_ROLES, ...CREATOR_ROLES];
export const CAN_SUBMIT_REVIEW = ["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR", "SENIOR_JOURNALIST", "JOURNALIST"];

export const roleLabelsMap: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CHIEF_EDITOR: "Editor Kepala",
  EDITOR: "Editor",
  SENIOR_JOURNALIST: "Jurnalis Senior",
  JOURNALIST: "Jurnalis",
  CONTRIBUTOR: "Kontributor",
};
