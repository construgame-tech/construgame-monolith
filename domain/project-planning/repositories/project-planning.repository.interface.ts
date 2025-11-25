import {
  ActivityEntity,
  MacrostepEntity,
  MacrostepOrderEntity,
} from "../entities/macrostep.entity";

export interface IMacrostepRepository {
  save(macrostep: MacrostepEntity): Promise<void>;
  delete(macrostepId: string): Promise<void>;
  findById(macrostepId: string): Promise<MacrostepEntity | null>;
  findByProjectId(projectId: string): Promise<MacrostepEntity[]>;
}

export interface IActivityRepository {
  save(activity: ActivityEntity): Promise<void>;
  delete(activityId: string): Promise<void>;
  findById(activityId: string): Promise<ActivityEntity | null>;
  findByMacrostepId(macrostepId: string): Promise<ActivityEntity[]>;
}

export interface IMacrostepOrderRepository {
  save(order: MacrostepOrderEntity): Promise<void>;
  findByProjectId(projectId: string): Promise<MacrostepOrderEntity | null>;
}
