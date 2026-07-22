import { postalToPlace } from "./extraValidate.js";
import {
  officialAddressCascade,
  searchOfficialCities,
  listShahrestan,
  listOfficialOstans,
} from "./officialGeo.js";
import { lookupPostalCode } from "./geo.js";

export type AddressFormInput = {
  postalCode?: string;
  province?: string;
  city?: string;
  county?: string;
  line?: string;
};

export function completeAddressForm(input: AddressFormInput) {
  const suggestions: Array<{ field: string; value: string; source: string; confidence: number }> = [];
  const warnings: string[] = [];
  let province = input.province?.trim();
  let city = input.city?.trim();
  let county = input.county?.trim();

  if (input.postalCode) {
    const postal = postalToPlace(input.postalCode);
    if (!postal.valid) warnings.push("کدپستی از نظر قالب نامعتبر است");
    if (postal.provinceFromPrefix) {
      if (province && !province.includes(String(postal.provinceFromPrefix).slice(0, 2))) {
        warnings.push("استان واردشده با پیش‌شمارهٔ کدپستی هم‌خوان نیست");
      }
      if (!province) {
        province = String(postal.provinceFromPrefix);
        suggestions.push({
          field: "province",
          value: province,
          source: "postal_prefix",
          confidence: 0.7,
        });
      }
    }
    if (postal.cityHint && !city) {
      city = postal.cityHint;
      suggestions.push({ field: "city", value: city, source: "postal_hint", confidence: 0.55 });
    }
  }

  if (city && !province) {
    const hits = searchOfficialCities(city, 5).cities;
    if (hits.length === 1) {
      province = hits[0]!.province;
      suggestions.push({
        field: "province",
        value: province,
        source: "city_lookup",
        confidence: 0.85,
      });
    } else if (hits.length > 1) {
      warnings.push("چند شهر هم‌نام — استان را صریح انتخاب کنید");
      suggestions.push(
        ...hits.slice(0, 3).map((h) => ({
          field: "cityCandidate",
          value: `${h.name} (${h.province})`,
          source: "city_lookup",
          confidence: 0.6,
        }))
      );
    }
  }

  if (province && !county) {
    const counties = listShahrestan(province, 5).counties;
    if (city) {
      const match = counties.find((c) => c.name.includes(city) || city.includes(c.name));
      if (match) {
        county = match.name;
        suggestions.push({ field: "county", value: county, source: "county_match", confidence: 0.75 });
      }
    }
  }

  const cascade = officialAddressCascade({
    ostan: province,
    shahrestan: county,
    cityQuery: city,
  });

  const legacyPostal = input.postalCode ? lookupPostalCode(input.postalCode) : null;

  return {
    input,
    filled: {
      province: province ?? null,
      county: county ?? null,
      city: city ?? null,
      postalCode: input.postalCode ?? null,
      line: input.line ?? null,
    },
    suggestions,
    warnings,
    approximate: Boolean(input.postalCode),
    disclaimer: "پیشنهادها بر پایه prefix کد پستی و geo رسمی — جایگزین استعلام پستی نیست.",
    cascade: {
      provinces: province ? undefined : listOfficialOstans().provinces.slice(0, 31),
      counties: cascade.counties.slice(0, 15),
      cities: cascade.cities.slice(0, 15),
    },
    legacyPostal,
  };
}
