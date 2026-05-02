import { dataService } from './dataService';

export const auditService = {
  listLogs: () => dataService.getAuditLogs(),
};
