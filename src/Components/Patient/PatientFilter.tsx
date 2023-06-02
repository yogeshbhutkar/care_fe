import { useEffect, useCallback } from "react";
import { FacilitySelect } from "../Common/FacilitySelect";
import AutoCompleteAsync from "../Form/AutoCompleteAsync";
import {
  GENDER_TYPES,
  FACILITY_TYPES,
  DISEASE_STATUS,
  PATIENT_FILTER_CATEGORIES,
  ADMITTED_TO,
} from "../../Common/constants";
import moment from "moment";
import {
  getAllLocalBody,
  getAnyFacility,
  getDistrict,
} from "../../Redux/actions";
import { useDispatch } from "react-redux";
import { navigate } from "raviger";
import DistrictSelect from "../Facility/FacilityFilter/DistrictSelect";
import SelectMenuV2 from "../Form/SelectMenuV2";
import TextFormField from "../Form/FormFields/TextFormField";
import {
  FieldChangeEvent,
  FieldChangeEventHandler,
} from "../Form/FormFields/Utils";
import { FieldLabel } from "../Form/FormFields/FormField";
import MultiSelectMenuV2 from "../Form/MultiSelectMenuV2";
import DateRangeFormField from "../Form/FormFields/DateRangeFormField";
import { DateRange } from "../Common/DateRangeInputV2";
import CareIcon from "../../CAREUI/icons/CareIcon";
import useMergeState from "../../Common/hooks/useMergeState";
import useConfig from "../../Common/hooks/useConfig";
import FiltersSlideover from "../../CAREUI/interactive/FiltersSlideover";
import AccordionV2 from "../Common/components/AccordionV2";

const getDate = (value: any) =>
  value && moment(value).isValid() && moment(value).toDate();

export default function PatientFilter(props: any) {
  const { kasp_enabled, kasp_string } = useConfig();
  const { filter, onChange, closeFilter } = props;

  const [filterState, setFilterState] = useMergeState({
    district: filter.district || "",
    facility: filter.facility || "",
    facility_type: filter.facility_type || "",
    lsgBody: filter.lsgBody || "",
    facility_ref: null,
    lsgBody_ref: null,
    district_ref: null,
    date_declared_positive_before: filter.date_declared_positive_before || null,
    date_declared_positive_after: filter.date_declared_positive_after || null,
    date_of_result_before: filter.date_of_result_before || null,
    date_of_result_after: filter.date_of_result_after || null,
    created_date_before: filter.created_date_before || null,
    created_date_after: filter.created_date_after || null,
    modified_date_before: filter.modified_date_before || null,
    modified_date_after: filter.modified_date_after || null,
    category: filter.category || null,
    gender: filter.gender || null,
    disease_status: filter.disease_status || null,
    age_min: filter.age_min || null,
    age_max: filter.age_max || null,
    date_of_result: filter.date_of_result || null,
    date_declared_positive: filter.date_declared_positive || null,
    last_consultation_admission_date_before:
      filter.last_consultation_admission_date_before || null,
    last_consultation_admission_date_after:
      filter.last_consultation_admission_date_after || null,
    last_consultation_discharge_date_before:
      filter.last_consultation_discharge_date_before || null,
    last_consultation_discharge_date_after:
      filter.last_consultation_discharge_date_after || null,
    last_consultation_admitted_bed_type_list:
      filter.last_consultation_admitted_bed_type_list
        ? filter.last_consultation_admitted_bed_type_list.split(",")
        : [],
    srf_id: filter.srf_id || null,
    number_of_doses: filter.number_of_doses || null,
    covin_id: filter.covin_id || null,
    is_kasp: filter.is_kasp || null,
    is_declared_positive: filter.is_declared_positive || null,
    last_consultation_symptoms_onset_date_before:
      filter.last_consultation_symptoms_onset_date_before || null,
    last_consultation_symptoms_onset_date_after:
      filter.last_consultation_symptoms_onset_date_after || null,
    last_vaccinated_date_before: filter.last_vaccinated_date_before || null,
    last_vaccinated_date_after: filter.last_vaccinated_date_after || null,
    last_consultation_is_telemedicine:
      filter.last_consultation_is_telemedicine || null,
    is_antenatal: filter.is_antenatal || null,
    ventilator_interface: filter.ventilator_interface || null,
  });
  const dispatch: any = useDispatch();

  const clearFilterState = {
    district: "",
    facility: "",
    facility_type: "",
    lsgBody: "",
    facility_ref: null,
    lsgBody_ref: null,
    district_ref: null,
    date_declared_positive_before: "",
    date_declared_positive_after: "",
    date_of_result_before: "",
    date_of_result_after: "",
    created_date_before: "",
    created_date_after: "",
    modified_date_before: "",
    modified_date_after: "",
    category: null,
    gender: null,
    disease_status: null,
    age_min: "",
    age_max: "",
    date_of_result: null,
    date_declared_positive: null,
    last_consultation_admission_date_before: "",
    last_consultation_admission_date_after: "",
    last_consultation_discharge_date_before: "",
    last_consultation_discharge_date_after: "",
    last_consultation_admitted_to_list: [],
    srf_id: "",
    number_of_doses: null,
    covin_id: "",
    is_kasp: null,
    is_declared_positive: null,
    last_consultation_symptoms_onset_date_before: "",
    last_consultation_symptoms_onset_date_after: "",
    last_vaccinated_date_before: "",
    last_vaccinated_date_after: "",
    last_consultation_is_telemedicine: null,
    is_antenatal: null,
    ventilator_interface: null,
  };

  useEffect(() => {
    async function fetchData() {
      if (filter.facility) {
        const { data: facilityData } = await dispatch(
          getAnyFacility(filter.facility, "facility")
        );
        setFilterState({ facility_ref: facilityData });
      }

      if (filter.district) {
        const { data: districtData } = await dispatch(
          getDistrict(filter.district, "district")
        );
        setFilterState({ district_ref: districtData });
      }

      if (filter.lsgBody) {
        const { data: lsgRes } = await dispatch(getAllLocalBody({}));
        const lsgBodyData = lsgRes.results;

        setFilterState({
          lsgBody_ref: lsgBodyData.filter(
            (obj: any) => obj.id.toString() === filter.lsgBody.toString()
          )[0],
        });
      }
    }
    fetchData();
  }, [dispatch]);

  const VACCINATED_FILTER = [
    { id: "0", text: "Unvaccinated" },
    { id: "1", text: "1st dose only" },
    { id: "2", text: "Both doses" },
    { id: "3", text: "Booster dose" },
  ];

  const DECLARED_FILTER = [
    { id: "false", text: "Not Declared" },
    { id: "true", text: "Declared" },
  ];

  const RESPIRATORY_SUPPORT_FILTER = [
    { id: "UNKNOWN", text: "None" },
    { id: "OXYGEN_SUPPORT", text: "O2 Support" },
    { id: "NON_INVASIVE", text: "NIV" },
    { id: "INVASIVE", text: "IV" },
  ];

  const TELEMEDICINE_FILTER = [
    { id: "true", text: "Yes" },
    { id: "false", text: "No" },
  ];

  const setFacility = (selected: any, name: string) => {
    const filterData: any = { ...filterState };
    filterData[`${name}_ref`] = selected;
    filterData[name] = (selected || {}).id;

    setFilterState(filterData);
  };

  const lsgSearch = useCallback(
    async (search: string) => {
      const res = await dispatch(getAllLocalBody({ local_body_name: search }));
      return res?.data?.results;
    },
    [dispatch]
  );

  const applyFilter = () => {
    const {
      district,
      facility,
      facility_type,
      lsgBody,
      date_declared_positive_before,
      date_declared_positive_after,
      date_of_result_before,
      date_of_result_after,
      created_date_before,
      created_date_after,
      modified_date_before,
      modified_date_after,
      category,
      gender,
      disease_status,
      age_min,
      age_max,
      date_of_result,
      last_consultation_admission_date_before,
      last_consultation_admission_date_after,
      last_consultation_discharge_date_before,
      last_consultation_discharge_date_after,
      last_consultation_admitted_bed_type_list,
      number_of_doses,
      covin_id,
      srf_id,
      is_kasp,
      is_declared_positive,
      last_consultation_symptoms_onset_date_before,
      last_consultation_symptoms_onset_date_after,
      last_vaccinated_date_before,
      last_vaccinated_date_after,
      last_consultation_is_telemedicine,
      is_antenatal,
      ventilator_interface,
    } = filterState;
    const data = {
      district: district || "",
      lsgBody: lsgBody || "",
      facility: facility || "",
      facility_type: facility_type || "",
      date_declared_positive_before:
        date_declared_positive_before &&
        moment(date_declared_positive_before).isValid()
          ? moment(date_declared_positive_before).format("YYYY-MM-DD")
          : "",
      date_declared_positive_after:
        date_declared_positive_after &&
        moment(date_declared_positive_after).isValid()
          ? moment(date_declared_positive_after).format("YYYY-MM-DD")
          : "",
      date_of_result_before:
        date_of_result_before && moment(date_of_result_before).isValid()
          ? moment(date_of_result_before).format("YYYY-MM-DD")
          : "",
      date_of_result_after:
        date_of_result_after && moment(date_of_result_after).isValid()
          ? moment(date_of_result_after).format("YYYY-MM-DD")
          : "",
      created_date_before:
        created_date_before && moment(created_date_before).isValid()
          ? moment(created_date_before).format("YYYY-MM-DD")
          : "",
      created_date_after:
        created_date_after && moment(created_date_after).isValid()
          ? moment(created_date_after).format("YYYY-MM-DD")
          : "",
      modified_date_before:
        modified_date_before && moment(modified_date_before).isValid()
          ? moment(modified_date_before).format("YYYY-MM-DD")
          : "",
      modified_date_after:
        modified_date_after && moment(modified_date_after).isValid()
          ? moment(modified_date_after).format("YYYY-MM-DD")
          : "",
      date_of_result:
        date_of_result && moment(date_of_result).isValid()
          ? moment(date_of_result).format("YYYY-MM-DD")
          : "",
      last_consultation_admission_date_before:
        last_consultation_admission_date_before &&
        moment(last_consultation_admission_date_before).isValid()
          ? moment(last_consultation_admission_date_before).format("YYYY-MM-DD")
          : "",
      last_consultation_admission_date_after:
        last_consultation_admission_date_after &&
        moment(last_consultation_admission_date_after).isValid()
          ? moment(last_consultation_admission_date_after).format("YYYY-MM-DD")
          : "",
      last_consultation_discharge_date_before:
        last_consultation_discharge_date_before &&
        moment(last_consultation_discharge_date_before).isValid()
          ? moment(last_consultation_discharge_date_before).format("YYYY-MM-DD")
          : "",
      last_consultation_discharge_date_after:
        last_consultation_discharge_date_after &&
        moment(last_consultation_discharge_date_after).isValid()
          ? moment(last_consultation_discharge_date_after).format("YYYY-MM-DD")
          : "",
      category: category || "",
      gender: gender || "",
      disease_status:
        (disease_status == "Show All" ? "" : disease_status) || "",
      age_min: age_min || "",
      age_max: age_max || "",
      last_consultation_admitted_bed_type_list:
        last_consultation_admitted_bed_type_list || [],
      srf_id: srf_id || "",
      number_of_doses: number_of_doses || "",
      covin_id: covin_id || "",
      is_kasp: is_kasp || "",
      is_declared_positive: is_declared_positive || "",
      last_consultation_symptoms_onset_date_before:
        last_consultation_symptoms_onset_date_before &&
        moment(last_consultation_symptoms_onset_date_before).isValid()
          ? moment(last_consultation_symptoms_onset_date_before).format(
              "YYYY-MM-DD"
            )
          : "",
      last_consultation_symptoms_onset_date_after:
        last_consultation_symptoms_onset_date_after &&
        moment(last_consultation_symptoms_onset_date_after).isValid()
          ? moment(last_consultation_symptoms_onset_date_after).format(
              "YYYY-MM-DD"
            )
          : "",
      last_vaccinated_date_before:
        last_vaccinated_date_before &&
        moment(last_vaccinated_date_before).isValid()
          ? moment(last_vaccinated_date_before).format("YYYY-MM-DD")
          : "",
      last_vaccinated_date_after:
        last_vaccinated_date_after &&
        moment(last_vaccinated_date_after).isValid()
          ? moment(last_vaccinated_date_after).format("YYYY-MM-DD")
          : "",
      last_consultation_is_telemedicine:
        last_consultation_is_telemedicine || "",
      is_antenatal: is_antenatal || "",
      ventilator_interface: ventilator_interface || "",
    };
    onChange(data);
  };

  const handleDateRangeChange = (event: FieldChangeEvent<DateRange>) => {
    const filterData: any = { ...filterState };
    filterData[`${event.name}_after`] = event.value.start?.toString();
    filterData[`${event.name}_before`] = event.value.end?.toString();
    setFilterState(filterData);
  };

  const handleFormFieldChange: FieldChangeEventHandler<string> = (event) =>
    setFilterState({ ...filterState, [event.name]: event.value });

  return (
    <FiltersSlideover
      advancedFilter={props}
      onApply={applyFilter}
      onClear={() => {
        navigate("/patients");
        setFilterState(clearFilterState);
        closeFilter();
      }}
    >
      <AccordionV2
        title={
          <h1 className="font-bold text-purple-500 text-left text-xl mb-4">
            Patient Details based
          </h1>
        }
        expanded={true}
        className="w-full rounded-md"
      >
        <div className="w-full grid gap-4 grid-cols-1">
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">Gender</FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={GENDER_TYPES}
              optionLabel={(o) => o.text}
              optionIcon={(o) => <i className="text-base">{o.icon}</i>}
              optionValue={(o) => o.id}
              value={filterState.gender}
              onChange={(v) => setFilterState({ ...filterState, gender: v })}
            />
          </div>
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">Category</FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={PATIENT_FILTER_CATEGORIES}
              optionLabel={(o) => o.text}
              optionValue={(o) => o.id}
              value={filterState.category}
              onChange={(v) => setFilterState({ ...filterState, category: v })}
            />
          </div>
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">Age</FieldLabel>
            <div className="flex justify-between gap-4">
              <TextFormField
                name="age_min"
                placeholder="Min. age"
                label={null}
                value={
                  filterState.age_min &&
                  (filterState.age_min > 0 ? filterState.age_min : 0)
                }
                type="number"
                min={0}
                onChange={handleFormFieldChange}
                errorClassName="hidden"
              />
              <TextFormField
                name="age_max"
                placeholder="Max. age"
                label={null}
                type="number"
                min={0}
                value={
                  filterState.age_max &&
                  (filterState.age_max > 0 ? filterState.age_max : 0)
                }
                onChange={handleFormFieldChange}
                errorClassName="hidden"
              />
            </div>
          </div>
          <div className="w-full flex-none" id="bed-type-select">
            <FieldLabel className="text-sm">Admitted to (Bed Types)</FieldLabel>
            <MultiSelectMenuV2
              id="last_consultation_admitted_bed_type_list"
              placeholder="Select bed types"
              options={ADMITTED_TO}
              value={filterState.last_consultation_admitted_bed_type_list}
              optionValue={(o) => o.id}
              optionLabel={(o) => o.text}
              onChange={(o) =>
                setFilterState({
                  ...filterState,
                  last_consultation_admitted_bed_type_list: o,
                })
              }
            />
          </div>
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">Telemedicine</FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={TELEMEDICINE_FILTER}
              optionLabel={(o) => o.text}
              optionValue={(o) => o.id}
              value={filterState.last_consultation_is_telemedicine}
              onChange={(v) =>
                setFilterState({
                  ...filterState,
                  last_consultation_is_telemedicine: v,
                })
              }
            />
          </div>
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">Respiratory Support</FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={RESPIRATORY_SUPPORT_FILTER}
              optionLabel={(o) => o.text}
              optionValue={(o) => o.id}
              value={filterState.ventilator_interface}
              onChange={(v) =>
                setFilterState({
                  ...filterState,
                  ventilator_interface: v,
                })
              }
            />
          </div>
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">Is Antenatal</FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={["true", "false"]}
              optionLabel={(o) =>
                o === "true" ? "Antenatal" : "Non-antenatal"
              }
              value={filterState.is_antenatal}
              onChange={(v) =>
                setFilterState({ ...filterState, is_antenatal: v })
              }
            />
          </div>
        </div>
      </AccordionV2>
      <AccordionV2
        title={
          <h1 className="font-bold text-purple-500 text-left text-xl mb-4">
            Date based
          </h1>
        }
        expanded={true}
        className="w-full rounded-md"
      >
        <div className="w-full grid gap-4 grid-cols-1">
          <DateRangeFormField
            labelClassName="text-sm"
            name="created_date"
            label="Registration Date"
            value={{
              start: getDate(filterState.created_date_after),
              end: getDate(filterState.created_date_before),
            }}
            onChange={handleDateRangeChange}
            errorClassName="hidden"
          />
          <DateRangeFormField
            labelClassName="text-sm"
            name="modified_date"
            label="Modified Date"
            value={{
              start: getDate(filterState.modified_date_after),
              end: getDate(filterState.modified_date_before),
            }}
            onChange={handleDateRangeChange}
            errorClassName="hidden"
          />
          <DateRangeFormField
            labelClassName="text-sm"
            name="last_consultation_admission_date"
            label="Admit Date"
            value={{
              start: getDate(
                filterState.last_consultation_admission_date_after
              ),
              end: getDate(filterState.last_consultation_admission_date_before),
            }}
            onChange={handleDateRangeChange}
            errorClassName="hidden"
          />
          <DateRangeFormField
            labelClassName="text-sm"
            name="last_consultation_discharge_date"
            label="Discharge Date"
            value={{
              start: getDate(
                filterState.last_consultation_discharge_date_after
              ),
              end: getDate(filterState.last_consultation_discharge_date_before),
            }}
            onChange={handleDateRangeChange}
            errorClassName="hidden"
          />
          <DateRangeFormField
            labelClassName="text-sm"
            name="last_consultation_symptoms_onset_date"
            label="Onset of Symptoms Date"
            value={{
              start: getDate(
                filterState.last_consultation_symptoms_onset_date_after
              ),
              end: getDate(
                filterState.last_consultation_symptoms_onset_date_before
              ),
            }}
            onChange={handleDateRangeChange}
            errorClassName="hidden"
          />
        </div>
      </AccordionV2>
      <AccordionV2
        title={
          <h1 className="font-bold text-purple-500 text-left text-xl mb-4">
            Geography based
          </h1>
        }
        expanded={true}
        className="w-full rounded-md"
      >
        <div className="w-full grid gap-4 grid-cols-1">
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">Facility</FieldLabel>
            <FacilitySelect
              multiple={false}
              name="facility"
              selected={filterState.facility_ref}
              showAll
              setSelected={(obj) => setFacility(obj, "facility")}
              className="shifting-page-filter-dropdown"
            />
          </div>

          <div className="w-full flex-none">
            <FieldLabel className="text-sm">Facility type</FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={FACILITY_TYPES}
              optionLabel={(o) => o.text}
              optionValue={(o) => o.text}
              value={filterState.facility_type}
              onChange={(v) =>
                setFilterState({ ...filterState, facility_type: v })
              }
              optionIcon={() => (
                <CareIcon className="care-l-hospital text-lg" />
              )}
            />
          </div>
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">LSG Body</FieldLabel>
            <div className="">
              <AutoCompleteAsync
                name="lsg_body"
                selected={filterState.lsgBody_ref}
                fetchData={lsgSearch}
                onChange={(selected) =>
                  setFilterState({
                    ...filterState,
                    lsgBody_ref: selected,
                    lsgBody: selected.id,
                  })
                }
                optionLabel={(option) => option.name}
                compareBy="id"
              />
            </div>
          </div>

          <div className="w-full flex-none">
            <FieldLabel className="text-sm">District</FieldLabel>
            <DistrictSelect
              multiple={false}
              name="district"
              selected={filterState.district_ref}
              setSelected={(obj: any) => setFacility(obj, "district")}
              className="shifting-page-filter-dropdown"
              errors={""}
            />
          </div>
        </div>
      </AccordionV2>
      <AccordionV2
        title={
          <h1 className="font-bold text-purple-500 text-left text-xl mb-4">
            COVID Details based
          </h1>
        }
        expanded={true}
        className="w-full rounded-md"
      >
        <div className="w-full grid gap-4 grid-cols-1">
          {kasp_enabled && (
            <div className="w-full flex-none">
              <FieldLabel className="text-sm">{kasp_string}</FieldLabel>
              <SelectMenuV2
                placeholder="Show all"
                options={[true, false]}
                optionLabel={(o) =>
                  o ? `Show ${kasp_string}` : `Show Non ${kasp_string}`
                }
                value={filterState.is_kasp}
                onChange={(v) => setFilterState({ ...filterState, is_kasp: v })}
              />
            </div>
          )}

          <div className="w-full flex-none">
            <FieldLabel className="text-sm">COVID Disease status</FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={DISEASE_STATUS}
              optionLabel={(o) => o}
              value={filterState.disease_status}
              onChange={(v) =>
                setFilterState({ ...filterState, disease_status: v })
              }
            />
          </div>
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">COVID Vaccinated</FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={VACCINATED_FILTER}
              optionLabel={({ text }) => text}
              optionValue={({ id }) => id}
              optionIcon={({ id }) => (
                <>
                  <CareIcon className="care-l-syringe w-5 mr-2" />
                  <span className="font-bold">{id}</span>
                </>
              )}
              value={filterState.number_of_doses}
              onChange={(v) =>
                setFilterState({ ...filterState, number_of_doses: v })
              }
            />
          </div>
          <div className="w-full flex-none">
            <FieldLabel className="text-sm">
              Declared as COVID Positive
            </FieldLabel>
            <SelectMenuV2
              placeholder="Show all"
              options={DECLARED_FILTER}
              optionLabel={(o) => o.text}
              optionValue={(o) => o.id}
              value={filterState.is_declared_positive}
              onChange={(v) =>
                setFilterState({ ...filterState, is_declared_positive: v })
              }
            />
          </div>

          <div className="w-full flex-none">
            <TextFormField
              id="srf_id"
              name="srf_id"
              placeholder="Filter by SRF ID"
              label={<span className="text-sm">SRF ID</span>}
              value={filterState.srf_id}
              onChange={handleFormFieldChange}
              errorClassName="hidden"
            />
          </div>
          <div className="w-full flex-none">
            <TextFormField
              id="covin_id"
              name="covin_id"
              placeholder="Filter by COWIN ID"
              label={<span className="text-sm">CoWIN ID</span>}
              value={filterState.covin_id}
              onChange={handleFormFieldChange}
              errorClassName="hidden"
            />
          </div>

          <DateRangeFormField
            labelClassName="text-sm"
            name="date_of_result"
            label="Date of result of COVID Test"
            value={{
              start: getDate(filterState.date_of_result_after),
              end: getDate(filterState.date_of_result_before),
            }}
            onChange={handleDateRangeChange}
            errorClassName="hidden"
          />
          <DateRangeFormField
            labelClassName="text-sm"
            name="date_declared_positive"
            label="Date declared COVID positive"
            value={{
              start: getDate(filterState.date_declared_positive_after),
              end: getDate(filterState.date_declared_positive_before),
            }}
            onChange={handleDateRangeChange}
            errorClassName="hidden"
          />

          <DateRangeFormField
            labelClassName="text-sm"
            name="last_vaccinated_date"
            label="Date of COVID Vaccination"
            value={{
              start: getDate(filterState.last_vaccinated_date_after),
              end: getDate(filterState.last_vaccinated_date_before),
            }}
            onChange={handleDateRangeChange}
            errorClassName="hidden"
          />
        </div>
      </AccordionV2>
    </FiltersSlideover>
  );
}
