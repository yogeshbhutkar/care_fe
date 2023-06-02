import moment from "moment";
import { navigate } from "raviger";
import { LocalStorageKeys } from "../Common/constants";

interface ApacheParams {
  age: number;
  organFailure: boolean;
  temperatureC: number;
  heartRate: number;
  respiratoryRate: number;
  sodium: number;
  potassium: number;
  creatinine: number;
  acuteRenalFailure: boolean;
  hematocrit: number;
  wbcCount: number;
  glasgowComaScore: number;
  fiO2: number;
}

export const calculateApache2Score = (apacheParams: ApacheParams): number => {
  const {
    age,
    organFailure,
    temperatureC,
    heartRate,
    respiratoryRate,
    sodium,
    potassium,
    creatinine,
    acuteRenalFailure,
    hematocrit,
    wbcCount,
    glasgowComaScore,
    fiO2,
  } = apacheParams;

  const ageScore = age < 65 ? 1 : 0;
  const organFailureScore = organFailure ? 1 : 0;
  const temperatureScore = temperatureC < 37.5 ? 1 : 0;
  const heartRateScore = heartRate < 60 ? 1 : 0;
  const respiratoryRateScore = respiratoryRate < 12 ? 1 : 0;
  const sodiumScore = sodium < 135 ? 1 : 0;
  const potassiumScore = potassium < 3.5 ? 1 : 0;
  const creatinineScore = creatinine < 0.7 ? 1 : 0;
  const acuteRenalFailureScore = acuteRenalFailure ? 1 : 0;
  const hematocritScore = hematocrit < 0.45 ? 1 : 0;
  const wbcCountScore = wbcCount < 10 ? 1 : 0;
  const glasgowComaScoreScore = glasgowComaScore < 6 ? 1 : 0;
  const fiO2Score = fiO2 < 0.7 ? 1 : 0;

  const totalScore =
    ageScore +
    organFailureScore +
    temperatureScore +
    heartRateScore +
    respiratoryRateScore +
    sodiumScore +
    potassiumScore +
    creatinineScore +
    acuteRenalFailureScore +
    hematocritScore +
    wbcCountScore +
    glasgowComaScoreScore +
    fiO2Score;

  return totalScore;
};

export const formatDate = (
  date: string | Date,
  format = "hh:mm A; DD/MM/YYYY"
) => {
  return moment(date).format(format);
};

export const relativeDate = (date: string | Date) => {
  const momentDate = moment(date);
  return `${momentDate.fromNow()} at ${momentDate.format("hh:mm A")}`;
};

export const relativeTime = (time: string | Date) => {
  const momentTime = moment(time);
  return `${momentTime.fromNow()}`;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const handleSignOut = (forceReload: boolean) => {
  Object.values(LocalStorageKeys).forEach((key) =>
    localStorage.removeItem(key)
  );
  navigate("/");
  if (forceReload) window.location.reload();
};

/**
 * Referred from: https://stackoverflow.com/a/9039885/7887936
 * @returns `true` if device is iOS, else `false`
 */
function _isAppleDevice() {
  if (navigator.platform.includes("Mac")) return true;
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

/**
 * `true` if device is iOS, else `false`
 */
export const isAppleDevice = _isAppleDevice();

/**
 * Conditionally concatenate classes. An alternate replacement for `clsx`.
 *
 * **Example Usage:**
 * ```tsx
 * <div className={classNames("md:flex", true && "p-0", false && "p-10")} />
 * // "md:flex p-0"
 * ```
 */
export const classNames = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface ISchema {
  [key: string]: {
    prop: string;
    oneOf?: string[];
    parse?: (value: any) => any;
    type?: any;
    required?: boolean;
  };
}

export const parseCsvFile = async (
  file: File,
  schema: ISchema | undefined = undefined
) => {
  const parseWithSchema: any = (schema: any, data: any) =>
    Object.keys(schema).reduce((acc, key) => {
      if (schema[key]?.oneOf && !schema[key].oneOf.includes(data[key]))
        throw new Error(`${key} should be one of the ${schema[key].oneOf}`);

      const value =
        typeof schema[key]?.type === "object"
          ? parseWithSchema(schema[key]?.type, data)
          : schema[key]?.parse?.(data[key]) ?? data[key];

      if (schema[key]?.required && (value === undefined || value === null))
        throw new Error(`${key} is required`);

      return value === undefined || value === null
        ? acc
        : {
            ...acc,
            [schema[key]?.prop]: value,
          };
    }, {});

  const csvData = (await file.text())
    .trim()
    .split("\n")
    .map((row: string) => row.split(","));

  const parsed = csvData
    .map((row: string[]) =>
      row.reduce((acc, val, i) => ({ ...acc, [csvData[0][i]]: val }), {})
    )
    .splice(1)
    .map((csvMap: any) => (schema ? parseWithSchema(schema, csvMap) : csvMap));

  return parsed;
};

export const getPincodeDetails = async (pincode: string, apiKey: string) => {
  const response = await fetch(
    `https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd?api-key=${apiKey}&format=json&filters[pincode]=${pincode}&limit=1`
  );
  const data = await response.json();
  return data.records[0];
};

export const includesIgnoreCase = (str1: string, str2: string) => {
  const lowerCaseStr1 = str1.toLowerCase();
  const lowerCaseStr2 = str2.toLowerCase();
  return (
    lowerCaseStr1.includes(lowerCaseStr2) ||
    lowerCaseStr2.includes(lowerCaseStr1)
  );
};

export const getExperienceSuffix = (date?: Date) => {
  if (!date) return "0 Years";

  const today = new Date();

  let m = (today.getFullYear() - date.getFullYear()) * 12;
  m -= date.getMonth();
  m += today.getMonth();

  let str = "";

  const years = Math.floor(m / 12);
  const months = m % 12;

  if (years) str += `${years} years `;
  if (months) str += `${months} months`;

  return str;
};

export const formatCurrency = (price: number) =>
  price.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
