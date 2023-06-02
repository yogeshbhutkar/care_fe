import { useState, useEffect } from "react";
import { getAnyFacility } from "../../Redux/actions";
import { useDispatch } from "react-redux";
import { SHIFTING_FILTER_ORDER } from "../../Common/constants";

export default function BadgesList(props: any) {
  const { appliedFilters, FilterBadges } = props;
  const [orginFacilityName, setOrginFacilityName] = useState("");
  const [approvingFacilityName, setApprovingFacilityName] = useState("");
  const [assignedFacilityName, setAssignedFacilityName] = useState("");
  const dispatch: any = useDispatch();

  useEffect(() => {
    async function fetchData() {
      if (!appliedFilters.orgin_facility) return setOrginFacilityName("");
      const res = await dispatch(
        getAnyFacility(appliedFilters.orgin_facility, "orgin_facility")
      );
      setOrginFacilityName(res?.data?.name);
    }
    fetchData();
  }, [dispatch, appliedFilters.orgin_facility]);

  useEffect(() => {
    async function fetchData() {
      if (!appliedFilters.approving_facility)
        return setApprovingFacilityName("");
      const res = await dispatch(
        getAnyFacility(appliedFilters.approving_facility, "approving_facility")
      );
      setApprovingFacilityName(res?.data?.name);
    }
    fetchData();
  }, [dispatch, appliedFilters.approving_facility]);

  useEffect(() => {
    async function fetchData() {
      if (!appliedFilters.assigned_facility) return setAssignedFacilityName("");
      const res = await dispatch(
        getAnyFacility(appliedFilters.assigned_facility, "assigned_facility")
      );
      setAssignedFacilityName(res?.data?.name);
    }
    fetchData();
  }, [dispatch, appliedFilters.assigned_facility]);

  const getDescShiftingFilterOrder = (ordering: any) => {
    let desc = "";
    SHIFTING_FILTER_ORDER.map((item: any) => {
      if (item.text === ordering) {
        desc = item.desc;
      }
    });
    return desc;
  };

  return (
    <FilterBadges
      badges={({ badge, value, boolean, dateRange }: any) => [
        value(
          "Ordering",
          "ordering",
          getDescShiftingFilterOrder(appliedFilters.ordering)
        ),
        badge("Status", "status"),
        boolean("Emergency", "emergency", {
          trueValue: "yes",
          falseValue: "no",
        }),
        ...dateRange("Modified", "modified_date"),
        ...dateRange("Created", "created_date"),
        value("Origin facility", "orgin_facility", orginFacilityName),
        value(
          "Approving facility",
          "approving_facility",
          approvingFacilityName
        ),
        value("Assigned facility", "assigned_facility", assignedFacilityName),
      ]}
    />
  );
}
