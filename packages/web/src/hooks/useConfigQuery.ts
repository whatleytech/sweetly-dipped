import { useQuery } from '@tanstack/react-query';
import type {
  PackageOptionDto,
  TreatOptionDto,
  TimeSlotsDto,
  UnavailablePeriodDto,
} from '@sweetly-dipped/shared-types';
import { configApi } from '@/api/configApi';

export function usePackageOptions() {
  return useQuery<PackageOptionDto[]>({
    queryKey: ['config', 'packages'],
    queryFn: () => configApi.getPackageOptions(),
    staleTime: Infinity,
  });
}

export function useTreatOptions() {
  return useQuery<TreatOptionDto[]>({
    queryKey: ['config', 'treats'],
    queryFn: () => configApi.getTreatOptions(),
    staleTime: Infinity,
  });
}

export function useTimeSlots() {
  return useQuery<TimeSlotsDto>({
    queryKey: ['config', 'time-slots'],
    queryFn: () => configApi.getTimeSlots(),
    staleTime: Infinity,
  });
}

export function useUnavailablePeriods() {
  return useQuery<UnavailablePeriodDto[]>({
    queryKey: ['config', 'unavailable-periods'],
    queryFn: () => configApi.getUnavailablePeriods(),
    staleTime: Infinity,
  });
}


