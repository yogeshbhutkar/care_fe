import { useState, useCallback, useEffect, ReactElement } from "react";

import loadable from "@loadable/component";
import { assetClassProps, AssetData, AssetTransaction } from "./AssetTypes";
import { statusType, useAbortableEffect } from "../../Common/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAsset,
  getAsset,
  listAssetTransaction,
} from "../../Redux/actions";
import Pagination from "../Common/Pagination";
import { navigate } from "raviger";
import QRCode from "qrcode.react";
import AssetWarrantyCard from "./AssetWarrantyCard";
import { formatDate } from "../../Utils/utils";
import Chip from "../../CAREUI/display/Chip";
import CareIcon from "../../CAREUI/icons/CareIcon";
import ButtonV2 from "../Common/components/ButtonV2";
import { UserRole, USER_TYPES } from "../../Common/constants";
import moment from "moment";
import ConfirmDialogV2 from "../Common/ConfirmDialogV2";
import RecordMeta from "../../CAREUI/display/RecordMeta";
import { useTranslation } from "react-i18next";
const PageTitle = loadable(() => import("../Common/PageTitle"));
const Loading = loadable(() => import("../Common/Loading"));
import * as Notification from "../../Utils/Notifications.js";
import { NonReadOnlyUsers } from "../../Utils/AuthorizeFor";

interface AssetManageProps {
  assetId: string;
  facilityId: string;
}

const checkAuthority = (type: string, cutoff: string) => {
  const userAuthority = USER_TYPES.indexOf(type as UserRole);
  const cutoffAuthority = USER_TYPES.indexOf(cutoff as UserRole);
  return userAuthority >= cutoffAuthority;
};

const AssetManage = (props: AssetManageProps) => {
  const { t } = useTranslation();
  const { assetId, facilityId } = props;
  const [asset, setAsset] = useState<AssetData>();
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [transactions, setTransactions] = useState<AssetTransaction[]>([]);
  const [transactionDetails, setTransactionDetails] = useState<
    ReactElement | ReactElement[]
  >();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch<any>();
  const limit = 14;
  const { currentUser }: any = useSelector((state) => state);
  const user_type = currentUser.data.user_type;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchData = useCallback(
    async (status: statusType) => {
      setIsLoading(true);
      const assetData = await dispatch(getAsset(assetId));
      if (!status.aborted) {
        setIsLoading(false);
        if (assetData && assetData.data) {
          setAsset(assetData.data);

          const transactionFilter = assetData.qr_code_id
            ? { qr_code_id: assetData.qr_code_id }
            : { external_id: assetId };

          const transactionsData = await dispatch(
            listAssetTransaction({
              ...transactionFilter,
              limit,
              offset,
            })
          );
          if (transactionsData && transactionsData.data) {
            setTransactions(transactionsData.data.results);
            setTotalCount(transactionsData.data.count);
          } else {
            Notification.Error({
              msg: "Error fetching transactions",
            });
          }
        } else {
          navigate("/not-found");
        }
      }
    },
    [dispatch, assetId, offset]
  );

  useAbortableEffect(
    (status: statusType) => {
      fetchData(status);
    },
    [dispatch, fetchData]
  );

  const handlePagination = (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    setCurrentPage(page);
    setOffset(offset);
  };

  const PrintPreview = () => (
    <div className="">
      <div className="my-4 flex justify-end ">
        <button
          onClick={(_) => window.print()}
          className="btn btn-primary mr-2"
        >
          <i className="fas fa-print mr-2"></i> Print QR Code
        </button>
        <button
          onClick={(_) => setIsPrintMode(false)}
          className="btn btn-default"
        >
          <i className="fas fa-times mr-2"></i> Close
        </button>
      </div>
      <h2 className="text-center">Print Preview</h2>
      <div id="section-to-print" className="print flex justify-center">
        <QRCode size={200} value={asset?.id || ""} />
      </div>
    </div>
  );
  const populateTableRows = (txns: AssetTransaction[]) => {
    if (txns.length > 0) {
      setTransactionDetails(
        transactions.map((transaction: AssetTransaction) => (
          <tr key={`transaction_id_${transaction.id}`}>
            <td className="px-6 py-4 text-left whitespace-nowrap text-sm leading-5 text-gray-500">
              <span className="text-gray-900 font-medium">
                {transaction.from_location.name}
              </span>
            </td>
            <td className="px-6 py-4 text-left whitespace-nowrap text-sm leading-5 text-gray-500">
              <span className="text-gray-900 font-medium">
                {transaction.to_location.name}
              </span>
            </td>
            <td className="px-6 py-4 text-left whitespace-nowrap text-sm leading-5 text-gray-500">
              <span className="text-gray-900 font-medium">
                {transaction.performed_by.first_name}{" "}
                {transaction.performed_by.last_name}
              </span>
            </td>
            <td className="px-6 py-4 text-left whitespace-nowrap text-sm leading-5 text-gray-500">
              <span className="text-gray-900 font-medium">
                {formatDate(transaction.modified_date)}
              </span>
            </td>
          </tr>
        ))
      );
    } else {
      setTransactionDetails(
        <tr>
          <td
            className="px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500 text-center"
            colSpan={4}
          >
            <h5>No Transactions Found</h5>
          </td>
        </tr>
      );
    }
  };

  useEffect(() => {
    populateTableRows(transactions);
  }, [transactions]);

  if (isLoading) return <Loading />;
  if (isPrintMode) return <PrintPreview />;

  const assetClassProp =
    (asset?.asset_class && assetClassProps[asset.asset_class]) ||
    assetClassProps.NONE;

  const detailBlock = (item: any) =>
    item.hide ? null : (
      <div className="flex flex-col grow-0 md:w-[200px]">
        <div className="flex flex-start items-center">
          <div className="w-8">
            <CareIcon className={`care-l-${item.icon} text-lg fill-gray-700`} />
          </div>
          <div className="text-gray-700 break-words">{item.label}</div>
        </div>
        <div className="font-semibold text-lg ml-8 break-words grow-0">
          {item.content || "--"}
        </div>
      </div>
    );

  const downloadJSON = (data: AssetData) => {
    const a = document.createElement("a");
    const blob = new Blob([JSON.stringify([data])], {
      type: "application/json",
    });
    a.href = URL.createObjectURL(blob);
    a.download = `asset_${data.id}.json`;
    a.click();
  };

  const handleDownload = async () => {
    if (asset) downloadJSON(asset);
  };

  const handleDelete = async () => {
    if (asset) {
      const response = await dispatch(deleteAsset(asset.id));
      if (response && response.status === 204) {
        navigate("/assets");
      }
    }
  };

  return (
    <div className="px-2 pb-2">
      <PageTitle
        title="Asset Details"
        crumbsReplacements={{
          [facilityId]: { name: asset?.location_object.facility.name },
          assets: { uri: `/assets?facility=${facilityId}` },
          [assetId]: {
            name: asset?.name,
          },
        }}
        backUrl="/assets"
      />
      <ConfirmDialogV2
        title="Delete Asset"
        description="Are you sure you want to delete this asset?"
        action="Confirm"
        variant="danger"
        show={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="bg-white rounded-lg md:rounded-xl w-full flex service-panel">
          <div className="w-full md:p-8 md:pt-6 p-6 pt-4 flex flex-col justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-2xl md:text-3xl font-bold break-words">
                    {asset?.name}
                  </span>
                  <ButtonV2
                    onClick={handleDownload}
                    className="tooltip p-4"
                    variant="secondary"
                    ghost
                    circle
                  >
                    <CareIcon className="care-l-export text-lg" />
                    <span className="tooltip-text tooltip-bottom -translate-x-16">
                      Export as JSON
                    </span>
                  </ButtonV2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {asset?.status === "ACTIVE" ? (
                    <Chip color="green" text="Active" startIcon="check" />
                  ) : (
                    <Chip
                      color="yellow"
                      text="Transfer in progress"
                      startIcon="exclamation"
                    />
                  )}
                  {asset?.is_working ? (
                    <Chip color="green" text="Working" startIcon="check" />
                  ) : (
                    <Chip color="red" text="Not Working" startIcon="times" />
                  )}
                </div>
              </div>
              <span className="text-gray-700">{asset?.description}</span>
            </div>
            <div className="flex flex-col gap-6">
              {[
                {
                  label: asset?.location_object.facility.name,
                  icon: "location-pin-alt",
                  content: asset?.location_object.name,
                },
                {
                  label: "Asset Type",
                  icon: "apps",
                  content:
                    asset?.asset_type === "INTERNAL"
                      ? "Internal Asset"
                      : "External Asset",
                },
                {
                  label: "Asset Class",
                  icon: assetClassProp.icon,
                  content: assetClassProp.name,
                },
                {
                  label: "Asset QR Code ID",
                  icon: "qrcode-scan",
                  content: asset?.qr_code_id,
                },
                {
                  label: "Not working reason",
                  icon: "exclamation-circle",
                  content: asset?.not_working_reason,
                  hide: asset?.is_working,
                },
              ].map(detailBlock)}
            </div>
            <div className="flex flex-col md:flex-row gap-1">
              <ButtonV2
                className="flex gap-2"
                onClick={() =>
                  navigate(
                    `/facility/${asset?.location_object.facility.id}/assets/${asset?.id}/update`
                  )
                }
                id="update-asset"
                authorizeFor={NonReadOnlyUsers}
              >
                <CareIcon className="care-l-pen h-4 mr-1" />
                {t("update")}
              </ButtonV2>
              {asset?.asset_class && (
                <ButtonV2
                  onClick={() =>
                    navigate(
                      `/facility/${asset?.location_object.facility.id}/assets/${asset?.id}/configure`
                    )
                  }
                  id="configure-asset"
                  authorizeFor={NonReadOnlyUsers}
                >
                  <CareIcon className="care-l-setting h-4" />
                  {t("configure")}
                </ButtonV2>
              )}
              {checkAuthority(user_type, "DistrictAdmin") && (
                <ButtonV2
                  authorizeFor={NonReadOnlyUsers}
                  onClick={() => setShowDeleteDialog(true)}
                  variant="danger"
                  className="inline-flex"
                >
                  <CareIcon className="care-l-trash h-4" />
                  <span className="md:hidden">{t("delete")}</span>
                </ButtonV2>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-between md:p-8 p-6 md:border-l border-gray-300 shrink-0">
            <div>
              <div className="font-bold text-lg mb-5">Service Details</div>
              <div className="flex flex-col gap-6">
                {[
                  {
                    label: "Last serviced on",
                    icon: "wrench",
                    content:
                      asset?.last_serviced_on &&
                      moment(asset?.last_serviced_on).format("DD MMM YYYY"),
                  },
                  {
                    label: "Notes",
                    icon: "notes",
                    content: asset?.notes,
                  },
                ].map(detailBlock)}
              </div>
            </div>

            <div className="flex flex-col text-sm text-gray-600 break-words justify-end">
              {asset?.created_date && (
                <RecordMeta prefix={t("created")} time={asset?.created_date} />
              )}
              {asset?.modified_date && (
                <RecordMeta prefix={t("updated")} time={asset?.modified_date} />
              )}
            </div>
          </div>
        </div>
        {asset && (
          <div className="flex gap-8 lg:gap-4 xl:gap-8 items-center justify-center flex-col md:flex-row xl:flex-col transition-all duration-200 ease-in">
            <AssetWarrantyCard asset={asset} />
          </div>
        )}
      </div>
      <div className="text-xl font-semibold mt-8 mb-4">Transaction History</div>
      <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Moved from
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Moved to
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Moved By
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Moved On
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactionDetails}
          </tbody>
        </table>
      </div>
      {totalCount > limit && (
        <div className="mt-4 flex w-full justify-center">
          <Pagination
            cPage={currentPage}
            defaultPerPage={limit}
            data={{ totalCount }}
            onChange={handlePagination}
          />
        </div>
      )}
    </div>
  );
};

export default AssetManage;
