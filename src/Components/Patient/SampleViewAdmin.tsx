import SampleFilter from "./SampleFilters";
import { navigate } from "raviger";
import loadable from "@loadable/component";
import { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SAMPLE_TEST_STATUS,
  SAMPLE_TEST_RESULT,
  SAMPLE_FLOW_RULES,
  SAMPLE_TYPE_CHOICES,
} from "../../Common/constants";
import { statusType, useAbortableEffect } from "../../Common/utils";
import {
  getTestList,
  patchSample,
  downloadSampleTests,
  getAnyFacility,
} from "../../Redux/actions";
import * as Notification from "../../Utils/Notifications";
import { SampleTestModel } from "./models";
import UpdateStatusDialog from "./UpdateStatusDialog";
import { formatDate } from "../../Utils/utils";
import SearchInput from "../Form/SearchInput";
import useFilters from "../../Common/hooks/useFilters";
import { ExportButton } from "../Common/Export";
import CountBlock from "../../CAREUI/display/Count";
import CareIcon from "../../CAREUI/icons/CareIcon";
import { AdvancedFilterButton } from "../../CAREUI/interactive/FiltersSlideover";
const Loading = loadable(() => import("../Common/Loading"));
const PageTitle = loadable(() => import("../Common/PageTitle"));

export default function SampleViewAdmin() {
  const {
    qParams,
    updateQuery,
    Pagination,
    FilterBadges,
    advancedFilter,
    resultsPerPage,
  } = useFilters({
    limit: 10,
  });
  const dispatch: any = useDispatch();
  const initialData: any[] = [];
  let manageSamples: any = null;
  const [sample, setSample] = useState<Array<SampleTestModel>>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchFlag, callFetchData] = useState(false);
  const [facilityName, setFacilityName] = useState("");
  const [statusDialog, setStatusDialog] = useState<{
    show: boolean;
    sample: SampleTestModel;
  }>({ show: false, sample: {} });
  const state: any = useSelector((state) => state);
  const { currentUser } = state;
  const userType: "Staff" | "DistrictAdmin" | "StateLabAdmin" =
    currentUser.data.user_type;

  useEffect(() => {
    async function fetchData() {
      if (!qParams.facility) return setFacilityName("");
      const res = await dispatch(getAnyFacility(qParams.facility));
      setFacilityName(res?.data?.name);
    }
    fetchData();
  }, [dispatch, qParams.facility]);

  const fetchData = useCallback(
    async (status: statusType) => {
      setIsLoading(true);
      const res = await dispatch(
        getTestList({
          limit: resultsPerPage,
          offset: (qParams.page ? qParams.page - 1 : 0) * resultsPerPage,
          patient_name: qParams.patient_name || undefined,
          district_name: qParams.district_name || undefined,
          status: qParams.status || undefined,
          result: qParams.result || undefined,
          facility: qParams.facility || "",
          sample_type: qParams.sample_type || undefined,
        })
      );
      if (!status.aborted) {
        if (res && res.data) {
          setSample(res.data.results);
          setTotalCount(res.data.count);
        }
        setIsLoading(false);
      }
    },
    [
      dispatch,
      qParams.page,
      qParams.patient_name,
      qParams.district_name,
      qParams.status,
      qParams.result,
      qParams.facility,
      qParams.sample_type,
    ]
  );

  useAbortableEffect(
    (status: statusType) => {
      fetchData(status);
    },
    [fetchData, fetchFlag]
  );

  const handleApproval = async (
    sample: SampleTestModel,
    status: number,
    result: number
  ) => {
    const sampleData: any = {
      id: sample.id,
      status,
      consultation: sample.consultation,
    };
    if (status === 7) {
      sampleData.result = result;
      sampleData.date_of_result = new Date().toISOString();
    }
    const statusName = SAMPLE_TEST_STATUS.find((i) => i.id === status)?.desc;
    const res = await dispatch(patchSample(sampleData, { id: sample.id }));
    if (res && (res.status === 201 || res.status === 200)) {
      Notification.Success({
        msg: `Success - ${statusName}`,
      });
      callFetchData(!fetchFlag);
    }
    dismissUpdateStatus();
  };

  const showUpdateStatus = (sample: SampleTestModel) => {
    setStatusDialog({
      show: true,
      sample,
    });
  };

  const dismissUpdateStatus = () => {
    setStatusDialog({
      show: false,
      sample: {},
    });
  };

  const parseExportData = (data: string) =>
    data
      .trim()
      .split("\n")
      .map((row: string) =>
        row
          .trim()
          .split(",")
          .map((field: string) =>
            new Date(field).toString() === "Invalid Date"
              ? field
              : formatDate(field, "DD/MM/YYYY hh:mm A")
          )
          .join(",")
      )
      .join("\n");

  let sampleList: any[] = [];
  if (sample && sample.length) {
    sampleList = sample.map((item) => {
      const status = String(item.status) as keyof typeof SAMPLE_FLOW_RULES;
      const statusText = SAMPLE_TEST_STATUS.find(
        (i) => i.text === status
      )?.desc;
      return (
        <div key={`usr_${item.id}`} className="w-full lg:w-1/2 mt-6 lg:px-4">
          <div
            className={`block border rounded-lg bg-white shadow h-full hover:border-black text-black ${
              item.result === "POSITIVE" ? "border-red-700 bg-red-100" : ""
            } ${
              item.result === "NEGATIVE"
                ? "border-primary-700 bg-primary-100"
                : ""
            }`}
          >
            <div className="px-6 py-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div className="font-bold text-xl capitalize mb-2">
                    {item.patient_name}
                  </div>
                  <div>
                    {item.sample_type && (
                      <span className="truncate bg-blue-200 text-blue-800 text-sm rounded-md font-bold px-2 py-1 mx-1 text-wrap">
                        Type: {item.sample_type}
                      </span>
                    )}
                  </div>
                </div>
                {item.result !== "AWAITING" && (
                  <div className="capitalize">
                    <span className="font-semibold leading-relaxed">
                      Result:{" "}
                    </span>
                    {item.result ? item.result.toLocaleLowerCase() : "-"}
                  </div>
                )}
                <div>
                  <span className="font-semibold leading-relaxed">
                    Status:{" "}
                  </span>
                  {statusText}
                </div>
                {item.facility_object && (
                  <div>
                    <span className="font-semibold leading-relaxed">
                      Facility:{" "}
                    </span>
                    {item.facility_object.name}
                  </div>
                )}
                {item.fast_track && (
                  <div>
                    <span className="font-semibold leading-relaxed">
                      Fast track:{" "}
                    </span>
                    {item.fast_track}
                  </div>
                )}
                {item.patient_has_confirmed_contact && (
                  <div>
                    <span className="font-semibold leading-relaxed">
                      Contact:{" "}
                    </span>
                    Confirmed carrier
                    <CareIcon className="care-l-exclamation-triangle text-red-500 text-xl font-bold" />
                  </div>
                )}
                {item.patient_has_suspected_contact &&
                  !item.patient_has_confirmed_contact && (
                    <div>
                      <span className="font-semibold leading-relaxed">
                        Contact:{" "}
                      </span>
                      Suspected carrier
                      <CareIcon className="care-l-exclamation-triangle text-xl font-bold text-yellow-500" />
                    </div>
                  )}
                {item.has_sari && (
                  <div>
                    <span className="font-semibold leading-relaxed">
                      SARI:{" "}
                    </span>
                    Severe Acute Respiratory illness
                    <CareIcon className="care-l-exclamation-triangle text-xl font-bold text-orange-500" />
                  </div>
                )}
                {item.has_ari && !item.has_sari && (
                  <div>
                    <span className="font-semibold leading-relaxed">ARI: </span>
                    Acute Respiratory illness
                    <CareIcon className=" care-l-exclamation-triangle text-xl font-bold text-yellow-500" />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="text-gray-600 text-sm font-bold">
                  <span className="text-gray-800">Date of Sample:</span>{" "}
                  {item.date_of_sample
                    ? formatDate(item.date_of_sample)
                    : "Not Available"}
                </div>

                <div className="text-gray-600 text-sm font-bold">
                  <span className="text-gray-800">Date of Result:</span>{" "}
                  {item.date_of_result
                    ? formatDate(item.date_of_result)
                    : "Not Available"}
                </div>
              </div>

              <div className="mt-2">
                {item.result === "AWAITING" && (
                  <div className="mt-2">
                    <button
                      onClick={() => showUpdateStatus(item)}
                      className="w-full text-sm bg-primary-500 hover:bg-primary-700 text-white font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center"
                    >
                      UPDATE SAMPLE TEST STATUS
                    </button>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/sample/${item.id}`)}
                  className="mt-2 w-full text-sm bg-white hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center"
                >
                  Sample Details
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  if (isLoading || !sample) {
    manageSamples = (
      <div className="flex justify-center w-full">
        <Loading />
      </div>
    );
  } else if (sample && sample.length) {
    manageSamples = (
      <>
        {sampleList}
        <Pagination totalCount={totalCount} />
      </>
    );
  } else if (sample && sample.length === 0) {
    manageSamples = (
      <div className="w-full bg-white rounded-lg p-3">
        <div className="text-2xl mt-4 text-gray-600  font-bold flex justify-center w-full">
          No Sample Tests Found
        </div>
      </div>
    );
  }

  return (
    <div className="px-6">
      {statusDialog.show && (
        <UpdateStatusDialog
          sample={statusDialog.sample}
          handleOk={handleApproval}
          handleCancel={dismissUpdateStatus}
          userType={userType}
        />
      )}
      <PageTitle
        title="Sample Management System"
        hideBack={true}
        breadcrumbs={false}
        componentRight={
          <ExportButton
            action={() => downloadSampleTests({ ...qParams })}
            parse={parseExportData}
            filenamePrefix="samples"
          />
        }
      />
      <div className="mt-5 lg:grid lg:grid-cols-1 gap-5">
        <div className="flex flex-col lg:flex-row gap-6 justify-between">
          <div className="w-full">
            <CountBlock
              text="Total Samples Taken"
              count={totalCount}
              loading={isLoading}
              icon={"thermometer"}
            />
          </div>

          <div className="w-full flex flex-col gap-3">
            <SearchInput
              name="patient_name"
              value={qParams.patient_name}
              onChange={(e) => updateQuery({ [e.name]: e.value })}
              placeholder="Search patient"
            />
            <SearchInput
              name="district_name"
              value={qParams.district_name}
              onChange={(e) => updateQuery({ [e.name]: e.value })}
              placeholder="Search by district"
              secondary
            />
          </div>

          <AdvancedFilterButton onClick={() => advancedFilter.setShow(true)} />
          <SampleFilter {...advancedFilter} key={window.location.search} />
        </div>
        <FilterBadges
          badges={({ badge, value }) => [
            badge("Patient Name", "patient_name"),
            badge("District Name", "district_name"),
            value(
              "Status",
              "status",
              SAMPLE_TEST_STATUS.find(
                (status) => status.id == qParams.status
              )?.text.replaceAll("_", " ") || ""
            ),
            value(
              "Result",
              "result",
              SAMPLE_TEST_RESULT.find((result) => result.id == qParams.result)
                ?.text || ""
            ),
            value(
              "Sample Test Type",
              "sample_type",
              SAMPLE_TYPE_CHOICES.find(
                (type) => type.id.toString() === qParams.sample_type
              )?.text || ""
            ),
            value("Facility", "facility", facilityName),
          ]}
        />
      </div>
      <div className="md:px-2">
        <div className="flex flex-wrap md:-mx-2 lg:-mx-6">{manageSamples}</div>
      </div>
    </div>
  );
}
