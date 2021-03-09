import { LogResult } from 'simple-git';

export interface IUpdate {
  status: boolean;
  commits: LogResult;
}
