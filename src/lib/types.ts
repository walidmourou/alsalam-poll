export interface Volunteer {
  id: number;
  date: string;
  full_name: string;
  phone_number: string;
  created_at: string;
}

export interface DayInfo {
  date: string;
  count: number;
  isFull: boolean;
  isEid: boolean;
  volunteers: Array<{
    full_name: string;
  }>;
}
