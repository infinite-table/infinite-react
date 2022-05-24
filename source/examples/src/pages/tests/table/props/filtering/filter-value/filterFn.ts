import { Employee } from '../employees10';

export function departmentManagementFilterFunction({
  data,
}: {
  data: Employee;
}): boolean {
  return data.department === 'Management';
}

export function departmentMarketingFilterFunction({
  data,
}: {
  data: Employee;
}): boolean {
  return data.department === 'Marketing';
}
