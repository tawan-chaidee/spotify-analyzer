export type PageKind = "connection" | "dashboard";
export type DashboardMode = "private" | "shared" | "mock";
export type DataSource = "live" | "mock";
export type ConnectionStatus =
  | "idle"
  | "authorizing"
  | "loading"
  | "error";

export interface AppViewState {
  page: PageKind;
  dashboardMode: DashboardMode;
  dataSource: DataSource;
  connectionStatus: ConnectionStatus;
}
