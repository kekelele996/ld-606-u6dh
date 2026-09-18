import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { routes } from "./router/routes";
import { mockData } from "./mocks/seedData";
import "./styles.css";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="shell">
    <aside><div class="brand">港口泊位与堆场协同系统</div><nav><button *ngFor="let route of routes" [class.active]="route.route === active" (click)="active = route.route">{{ route.name }}</button></nav></aside>
    <main class="page"><section class="page-head"><div><p class="eyebrow">port-yard</p><h1>{{ currentName }}</h1></div><span class="badge">LOCAL DATA</span></section>
    <section class="metrics"><div class="stat"><span>核心模型</span><strong>{{ entries.length }}</strong></div><div class="stat"><span>共享枚举</span><strong>3</strong></div><div class="stat"><span>本地记录</span><strong>{{ total }}</strong></div></section>
    <section class="workbench"><div class="panel wide"><h2>业务数据</h2><article class="row" *ngFor="let item of entries"><strong>{{ item[0] }}</strong><span>{{ item[1].length }} 条</span><span class="badge">READY</span></article></div><div class="panel"><h2>联动检查</h2><p>Angular 路由、服务、构造器、常量和展示组件按提示词拆分。</p></div></section></main>
  </div>`
})
class AppComponent {
  routes = routes;
  active: string = routes[0]?.route ?? "/dashboard";
  entries = Object.entries(mockData);
  get total() { return this.entries.reduce((sum, [, rows]) => sum + rows.length, 0); }
  get currentName() { return this.routes.find((route) => route.route === this.active)?.name ?? "工作台"; }
}

bootstrapApplication(AppComponent);
