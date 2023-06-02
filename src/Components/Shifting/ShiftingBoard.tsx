import React, { useEffect, useState } from "react";
import { classNames, formatDate } from "../../Utils/utils";
import {
  completeTransfer,
  downloadShiftRequests,
  listShiftRequests,
} from "../../Redux/actions";
import { useDrag, useDrop } from "react-dnd";

import ButtonV2 from "../Common/components/ButtonV2";
import CareIcon from "../../CAREUI/icons/CareIcon";
import CircularProgress from "../Common/components/CircularProgress";
import ConfirmDialogV2 from "../Common/ConfirmDialogV2";
import moment from "moment";
import { navigate } from "raviger";
import useConfig from "../../Common/hooks/useConfig";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CSVLink from "../Common/CSVLink";

const limit = 14;

interface boardProps {
  board: string;
  title?: string;
  filterProp: any;
  formatFilter: any;
}

const now = moment().format("DD-MM-YYYY:hh:mm:ss");

const reduceLoading = (action: string, current: any) => {
  switch (action) {
    case "MORE":
      return { ...current, more: true };
    case "BOARD":
      return { ...current, board: true };
    case "COMPLETE":
      return { board: false, more: false };
  }
};

const ShiftCard = ({ shift, filter }: any) => {
  const dispatch: any = useDispatch();
  const { wartime_shifting } = useConfig();
  const [modalFor, setModalFor] = useState({
    externalId: undefined,
    loading: false,
  });
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "shift-card",
    item: shift,
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));
  const rootState: any = useSelector((rootState) => rootState);
  const { currentUser } = rootState;
  const userHomeFacilityId = currentUser.data.home_facility;
  const userType = currentUser.data.user_type;
  const { t } = useTranslation();

  const handleTransferComplete = (shift: any) => {
    setModalFor({ ...modalFor, loading: true });
    dispatch(completeTransfer({ externalId: modalFor })).then(() => {
      navigate(
        `/facility/${shift.assigned_facility}/patient/${shift.patient}/consultation`
      );
    });
  };
  return (
    <div ref={drag} className="w-full mt-2">
      <div
        className="overflow-hidden shadow rounded-lg bg-white h-full mx-2"
        style={{
          opacity: isDragging ? 0.2 : 1,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <div
          className={classNames(
            "p-4 h-full flex flex-col justify-between",
            shift.patient_object.disease_status == "POSITIVE" && "bg-red-50"
          )}
        >
          <div>
            <div className="flex justify-between">
              <div className="font-bold text-xl capitalize mb-2">
                {shift.patient_object.name} - {shift.patient_object.age}
              </div>
              <div>
                {shift.emergency && (
                  <span className="shrink-0 inline-block px-2 py-0.5 text-red-800 text-xs leading-4 font-medium bg-red-100 rounded-full">
                    {t("emergency")}
                  </span>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-1 gap-x-1 gap-y-2 sm:grid-cols-1">
              <div className="sm:col-span-1">
                <dt
                  title={t("phone_number")}
                  className="text-sm leading-5 font-medium text-gray-500 flex items-center"
                >
                  <i className="fas fa-mobile mr-2" />
                  <dd className="font-bold text-sm leading-5 text-gray-900 break-normal">
                    {shift.patient_object.phone_number || ""}
                  </dd>
                </dt>
              </div>
              <div className="sm:col-span-1">
                <dt
                  title={t("origin_facility")}
                  className="text-sm leading-5 font-medium text-gray-500 flex items-center"
                >
                  <i className="fas fa-plane-departure mr-2"></i>
                  <dd className="font-bold text-sm leading-5 text-gray-900 break-normal">
                    {(shift.orgin_facility_object || {}).name}
                  </dd>
                </dt>
              </div>
              {wartime_shifting && (
                <div className="sm:col-span-1">
                  <dt
                    title={t("shifting_approving_facility")}
                    className="text-sm leading-5 font-medium text-gray-500 flex items-center"
                  >
                    <i className="fas fa-user-check mr-2"></i>
                    <dd className="font-bold text-sm leading-5 text-gray-900 break-normal">
                      {(shift.shifting_approving_facility_object || {}).name}
                    </dd>
                  </dt>
                </div>
              )}
              <div className="sm:col-span-1">
                <dt
                  title={t("assigned_facility")}
                  className="text-sm leading-5 font-medium text-gray-500 flex items-center"
                >
                  <i className="fas fa-plane-arrival mr-2"></i>

                  <dd className="font-bold text-sm leading-5 text-gray-900 break-normal">
                    {shift.assigned_facility_external ||
                      shift.assigned_facility_object?.name ||
                      t("yet_to_be_decided")}
                  </dd>
                </dt>
              </div>

              <div className="sm:col-span-1">
                <dt
                  title={t("last_modified")}
                  className={
                    "text-sm leading-5 font-medium flex items-center " +
                    (moment().subtract(2, "hours").isBefore(shift.modified_date)
                      ? "text-gray-900"
                      : "rounded p-1 bg-red-400 text-white")
                  }
                >
                  <i className="fas fa-stopwatch mr-2"></i>
                  <dd className="font-bold text-sm leading-5 break-normal">
                    {formatDate(shift.modified_date) || "--"}
                  </dd>
                </dt>
              </div>

              <div className="sm:col-span-1">
                <dt
                  title={t("patient_address")}
                  className="text-sm leading-5 font-medium text-gray-500 flex items-center"
                >
                  <i className="fas fa-home mr-2"></i>
                  <dd className="font-bold text-sm leading-5 text-gray-900 break-normal">
                    {shift.patient_object.address || "--"}
                  </dd>
                </dt>
              </div>

              {shift.assigned_to_object && (
                <div className="sm:col-span-1">
                  <dt
                    title={t("assigned_to")}
                    className="text-sm leading-5 font-medium text-gray-500 flex items-center"
                  >
                    <i className="fas fa-user mr-2"></i>
                    <dd className="font-bold text-sm leading-5 text-gray-900 break-normal">
                      {shift.assigned_to_object.first_name}{" "}
                      {shift.assigned_to_object.last_name} -{" "}
                      {shift.assigned_to_object.user_type}
                    </dd>
                  </dt>
                </div>
              )}

              <div className="sm:col-span-1">
                <dt
                  title={t("patient_state")}
                  className="text-sm leading-5 font-medium text-gray-500 flex items-center"
                >
                  <i className="fas fa-thumbtack mr-2"></i>
                  <dd className="font-bold text-sm leading-5 text-gray-900">
                    {shift.patient_object.state_object.name || "--"}
                  </dd>
                </dt>
              </div>
            </dl>
          </div>

          <div className="mt-2 flex">
            <button
              onClick={(_) => navigate(`/shifting/${shift.external_id}`)}
              className="btn w-full btn-default bg-white mr-2"
            >
              <i className="fas fa-eye mr-2" /> {t("all_details")}
            </button>
          </div>
          {filter === "COMPLETED" && shift.assigned_facility && (
            <div className="mt-2">
              <ButtonV2
                variant="secondary"
                className="w-full sm:whitespace-normal"
                disabled={
                  !shift.patient_object.allow_transfer ||
                  !(
                    ["DistrictAdmin", "StateAdmin"].includes(userType) ||
                    userHomeFacilityId === shift.assigned_facility
                  )
                }
                onClick={() => setModalFor(shift.external_id)}
              >
                {t("transfer_to_receiving_facility")}
              </ButtonV2>

              <ConfirmDialogV2
                title={t("confirm_transfer_complete")}
                description={t("mark_this_transfer_as_complete_question")}
                show={modalFor === shift.external_id}
                onClose={() =>
                  setModalFor({ externalId: undefined, loading: false })
                }
                action={t("confirm")}
                onConfirm={() => handleTransferComplete(shift)}
              >
                <p className="mt-2 text-sm text-yellow-600">
                  {t("redirected_to_create_consultation")}
                </p>
              </ConfirmDialogV2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ShiftingBoard({
  board,
  title,
  filterProp,
  formatFilter,
}: boardProps) {
  const dispatch: any = useDispatch();
  const [data, setData] = useState<any[]>([]);
  const [downloadFile, setDownloadFile] = useState("");
  const [totalCount, setTotalCount] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState({ board: false, more: false });
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "shift-card",
    drop: (item: any) => {
      if (item.status !== board) {
        navigate(`/shifting/${item.id}/update?status=${board}`);
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const fetchData = () => {
    setIsLoading((loading) => reduceLoading("BOARD", loading));
    dispatch(
      listShiftRequests(formatFilter({ ...filterProp, status: board }), board)
    ).then((res: any) => {
      if (res && res.data) {
        setData(res.data.results);
        setTotalCount(res.data.count);
        setCurrentPage(1);
      }
      setIsLoading((loading) => reduceLoading("COMPLETE", loading));
    });
  };

  const triggerDownload = async () => {
    // while is getting ready
    setDownloadLoading(true);
    const res = await dispatch(
      downloadShiftRequests({
        ...formatFilter({ ...filterProp, status: board }),
        csv: 1,
      })
    );
    // file ready to download
    setDownloadLoading(false);
    setDownloadFile(res.data);
    document.getElementById(`shiftRequests-${board}`)?.click();
  };

  useEffect(() => {
    fetchData();
  }, [
    board,
    dispatch,
    filterProp.facility,
    filterProp.orgin_facility,
    filterProp.shifting_approving_facility,
    filterProp.assigned_facility,
    filterProp.emergency,
    filterProp.is_up_shift,
    filterProp.patient_name,
    filterProp.created_date_before,
    filterProp.created_date_after,
    filterProp.modified_date_before,
    filterProp.modified_date_after,
    filterProp.patient_phone_number,
    filterProp.ordering,
    filterProp.is_kasp,
    filterProp.assigned_to,
    filterProp.disease_status,
    filterProp.is_antenatal,
    filterProp.breathlessness_level,
  ]);

  const handlePagination = (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    setCurrentPage(page);
    setIsLoading((loading) => reduceLoading("MORE", loading));
    dispatch(
      listShiftRequests(
        formatFilter({ ...filterProp, status: board, offset: offset }),
        board
      )
    ).then((res: any) => {
      if (res && res.data) {
        setData((data) => [...data, ...res.data.results]);
        setTotalCount(res.data.count);
      }
      setIsLoading((loading) => reduceLoading("COMPLETE", loading));
    });
  };
  const { t } = useTranslation();

  const patientFilter = (filter: string) => {
    return data
      .filter(({ status }) => status === filter)
      .map((shift: any) => (
        <ShiftCard key={`shift_${shift.id}`} shift={shift} filter={filter} />
      ));
  };

  return (
    <div
      ref={drop}
      className={classNames(
        "bg-gray-200 mr-2 flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 pb-4 h-full overflow-y-auto rounded-md",
        isOver && "cursor-move"
      )}
    >
      <div className="sticky top-0 pt-2 bg-gray-200 rounded z-10">
        <div className="flex justify-between p-4 mx-2 rounded bg-white shadow items-center">
          <h3 className="text-xs flex items-center h-8">
            {title || board}{" "}
            {downloadLoading ? (
              <CircularProgress className="w-6 h-6 ml-2 text-black" />
            ) : (
              <ButtonV2
                onClick={triggerDownload}
                className="tooltip p-4"
                variant="secondary"
                ghost
                circle
              >
                <CareIcon className="care-l-import text-lg font-bold" />
                <span className="tooltip-text tooltip-bottom -translate-x-16">
                  {t("download")}
                </span>
              </ButtonV2>
            )}
          </h3>
          <span className="rounded-lg ml-2 bg-primary-500 text-white px-2">
            {totalCount || "0"}
          </span>
        </div>
      </div>
      <div className="text-sm mt-2 pb-2 flex flex-col">
        {isLoading.board ? (
          <div className="m-1">
            <div className="border border-gray-300 bg-white shadow rounded-md p-4 max-w-sm w-full mx-auto">
              <div className="animate-pulse flex space-x-4 ">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-400 rounded"></div>
                    <div className="h-4 bg-gray-400 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : data?.length > 0 ? (
          patientFilter(board)
        ) : (
          <p className="mx-auto p-4">{t("no_patients_to_show")}</p>
        )}
        {!isLoading.board &&
          data?.length < (totalCount || 0) &&
          (isLoading.more ? (
            <div className="mx-auto my-4 p-2 px-4 bg-gray-100 rounded-md hover:bg-white">
              {t("loading")}
            </div>
          ) : (
            <button
              onClick={(_) => handlePagination(currentPage + 1, limit)}
              className="mx-auto my-4 p-2 px-4 bg-gray-100 rounded-md hover:bg-white"
            >
              More...
            </button>
          ))}
      </div>
      <CSVLink
        data={downloadFile}
        filename={`shift-requests-${board}-${now}.csv`}
        id={`shiftRequests-${board}`}
      />
    </div>
  );
}
