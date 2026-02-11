export interface Volunteer {
  id: number;
  date: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  created_at: string;
}

export interface DayInfo {
  date: string;
  count: number;
  isFull: boolean;
  isEid: boolean;
  volunteers: Array<{
    first_name: string;
    last_name: string;
  }>;
}
