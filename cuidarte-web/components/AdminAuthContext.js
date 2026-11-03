"use client";

import { createContext } from "react";

const AdminAuthContext = createContext({
  isSuperadmin: false,
  canDeleteRecords: false,
  registerUnsavedForm: () => {},
  notify: () => {},
});

export default AdminAuthContext;
