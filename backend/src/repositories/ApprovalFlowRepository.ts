import { db } from "../config/inMemoryDb";
import type { ApprovalFlow } from "../models/ApprovalFlow";

export const approvalFlowRepository = {
  findAll: (): ApprovalFlow[] => db.getTables().approvalFlow,
  findByPlan: (planId: number, tables = db.getTables()): ApprovalFlow[] =>
    tables.approvalFlow
      .filter((row) => row.berth_plan_id === planId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
  latestOfPlan: (planId: number, tables = db.getTables()): ApprovalFlow | undefined =>
    approvalFlowRepository.findByPlan(planId, tables)[0],
  nextId: (tables = db.getTables()): number =>
    tables.approvalFlow.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  append(flow: ApprovalFlow, tables: ReturnType<typeof db.getTables>): ApprovalFlow {
    tables.approvalFlow.push(flow);
    return flow;
  }
};
