import { IPCOAPIResponseHeader } from '../PCOAPIResponseHeader';

export interface IPCOAPIResponse {
  data_headers: IPCOAPIResponseHeader;
  data: any;
}