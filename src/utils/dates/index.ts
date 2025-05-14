
export * from "./converters";
export * from "./formatters";
export * from "./parsers";
export * from "./validators";
export * from "./constants";

// Utility function to check if we have local events
export const hasLocalStorageEvents = (): boolean => {
  return localStorage.getItem('calendarEvents') !== null;
};
