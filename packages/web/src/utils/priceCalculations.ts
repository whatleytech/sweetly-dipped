import type { AdditionalDesignOptionDto, FormData } from '@sweetly-dipped/shared-types';

/**
 * Calculates the display price for a single additional design option
 * based on the selected package type.
 */
export const calculateDesignOptionPrice = (
  option: AdditionalDesignOptionDto,
  packageType: FormData['packageType']
): number => {
  if (packageType === 'by-dozen') {
    return option.perDozenPrice ?? option.basePrice;
  }

  if (packageType === 'large' || packageType === 'xl') {
    return option.basePrice + (option.largePriceIncrease > 0 ? option.largePriceIncrease : 0);
  }

  // small, medium, or empty (show base price)
  return option.basePrice;
};

/**
 * Calculates the total price for all selected additional design options
 * based on the package type.
 */
export const calculateAdditionalDesignsTotal = (
  selectedDesigns: Array<{ id: string; name: string }>,
  designOptions: AdditionalDesignOptionDto[],
  packageType: FormData['packageType']
): number => {
  return selectedDesigns.reduce((total, selected) => {
    const option = designOptions.find((opt) => opt.id === selected.id);
    if (!option) return total;
    return total + calculateDesignOptionPrice(option, packageType);
  }, 0);
};

