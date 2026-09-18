import { Routes } from "@angular/router";
import { BerthsPage } from "../pages/BerthsPage";

/**
 * 泊位计划详情与审批工作台挂在 /berths；计划详情支持 /berths/:id 深链。
 * 其余页面保留占位组件，保证导航不中断。
 */
import { DashboardPage } from "../pages/DashboardPage";
import { VesselsPage } from "../pages/VesselsPage";
import { YardPage } from "../pages/YardPage";
import { TasksPage } from "../pages/TasksPage";

export const appRoutes: Routes = [
  { path: "", redirectTo: "berths", pathMatch: "full" },
  { path: "dashboard", component: DashboardPage },
  { path: "vessels", component: VesselsPage },
  { path: "berths", component: BerthsPage },
  { path: "berths/:id", component: BerthsPage },
  { path: "yard", component: YardPage },
  { path: "tasks", component: TasksPage },
  { path: "**", redirectTo: "berths" }
];
