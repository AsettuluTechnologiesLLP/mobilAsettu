// src/screens/Households/hooks/useHouseholdEditForm.ts
import type { UpdateHouseholdPayload } from '@services/api';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { HouseholdDetailDTO } from '../model/households';

type Errors = {
  name?: string;
  propertyOwnership?: string;
  occupancy?: string;
  type?: string;
};

export default function useHouseholdEditForm(detail: HouseholdDetailDTO | null) {
  // ----- original snapshot (for dirty diff) -----
  const original = useRef<{
    name: string;
    propertyOwnership: string | null;
    occupancy: string | null;
    type: string | null;
    version: string; // optimistic token (updatedAt/version from BE)
  } | null>(null);

  // ----- live form state -----
  const [name, setName] = useState<string>(detail?.name ?? '');
  const [propertyOwnership, setPropertyOwnership] = useState<string | null>(
    detail?.statuses?.propertyOwnership ?? null,
  );
  const [occupancy, setOccupancy] = useState<string | null>(detail?.statuses?.occupancy ?? null);
  const [type, setType] = useState<string | null>(detail?.statuses?.type ?? null);

  const [errors, setErrors] = useState<Errors>({});

  // Initialize/reset whenever a fresh detail arrives (by version)
  useEffect(() => {
    if (!detail) return;
    original.current = {
      name: detail.name ?? '',
      propertyOwnership: detail.statuses?.propertyOwnership ?? null,
      occupancy: detail.statuses?.occupancy ?? null,
      type: detail.statuses?.type ?? null,
      version: (detail.version || detail.updatedAt || '') as string,
    };
    setName(detail.name ?? '');
    setPropertyOwnership(detail.statuses?.propertyOwnership ?? null);
    setOccupancy(detail.statuses?.occupancy ?? null);
    setType(detail.statuses?.type ?? null);
    setErrors({});
  }, [detail]);

  // ----- derived flags -----
  const trimmedName = useMemo(() => (name ?? '').trim(), [name]);

  const dirty = useMemo(() => {
    const o = original.current;
    if (!o) return false;
    return (
      trimmedName !== o.name ||
      (propertyOwnership ?? null) !== o.propertyOwnership ||
      (occupancy ?? null) !== o.occupancy ||
      (type ?? null) !== o.type
    );
  }, [trimmedName, propertyOwnership, occupancy, type]);

  // ----- validation -----
  const validate = (): boolean => {
    const next: Errors = {};
    if (!trimmedName) next.name = 'Name is required.';
    // Optionally validate that status values exist in refs (if you pass them in later)
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ----- build minimal PATCH payload (only changed fields) -----
  const toPatchPayload = (): UpdateHouseholdPayload | null => {
    if (!original.current) return null;
    const o = original.current;

    const statuses: NonNullable<UpdateHouseholdPayload['statuses']> = {};
    let hasStatusChange = false;

    if ((propertyOwnership ?? null) !== o.propertyOwnership) {
      statuses.propertyOwnership = propertyOwnership;
      hasStatusChange = true;
    }
    if ((occupancy ?? null) !== o.occupancy) {
      statuses.occupancy = occupancy;
      hasStatusChange = true;
    }
    if ((type ?? null) !== o.type) {
      statuses.type = type;
      hasStatusChange = true;
    }

    const payload: UpdateHouseholdPayload = {
      version: o.version, // required
    };

    if (trimmedName !== o.name) {
      payload.name = trimmedName;
    }
    if (hasStatusChange) {
      payload.statuses = statuses;
    }

    return payload;
  };

  const reset = () => {
    const o = original.current;
    if (!o) return;
    setName(o.name);
    setPropertyOwnership(o.propertyOwnership);
    setOccupancy(o.occupancy);
    setType(o.type);
    setErrors({});
  };

  const loadFrom = (fresh: HouseholdDetailDTO) => {
    // convenience if parent wants to overwrite state with a fresh GET after save
    original.current = {
      name: fresh.name ?? '',
      propertyOwnership: fresh.statuses?.propertyOwnership ?? null,
      occupancy: fresh.statuses?.occupancy ?? null,
      type: fresh.statuses?.type ?? null,
      version: (fresh.version || fresh.updatedAt || '') as string,
    };
    setName(fresh.name ?? '');
    setPropertyOwnership(fresh.statuses?.propertyOwnership ?? null);
    setOccupancy(fresh.statuses?.occupancy ?? null);
    setType(fresh.statuses?.type ?? null);
    setErrors({});
  };

  return {
    // state
    form: { name, propertyOwnership, occupancy, type },
    // setters
    setName,
    setPropertyOwnership,
    setOccupancy,
    setType,
    // validation & diff
    errors,
    validate,
    dirty,
    // payload & controls
    toPatchPayload,
    reset,
    loadFrom,
  };
}
