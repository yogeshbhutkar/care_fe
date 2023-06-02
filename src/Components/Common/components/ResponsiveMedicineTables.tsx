import { useEffect, useState } from "react";
import AccordionV2 from "./AccordionV2";
import { classNames } from "../../../Utils/utils";

function getWindowSize() {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
}

export default function ResponsiveMedicineTable(props: {
  theads: Array<string>;
  list: Array<any>;
  objectKeys: Array<string>;
  fieldsToDisplay: Array<number>;
  actions?: (item: any) => JSX.Element;
  actionLabel?: string;
  maxWidthColumn?: number;
  onClick?: (item: any) => void;
}) {
  const [windowSize, setWindowSize] = useState(getWindowSize());
  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);
  return (
    <>
      {windowSize.innerWidth > 1024 ? (
        <table className="min-w-full">
          <thead>
            <tr>
              {props.theads.map((item) => {
                return (
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-800 uppercase tracking-wider whitespace-nowrap">
                    {item}
                  </th>
                );
              })}
              {props.actions && (
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-800 uppercase tracking-wider">
                  {props.actionLabel || ""}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {props.list?.map?.((med: any, index: number) => (
              <tr
                className={classNames(
                  "bg-white",
                  props.onClick && "hover:bg-gray-200 cursor-pointer"
                )}
                key={index}
                onClick={() => props.onClick && props.onClick(med)}
              >
                {props.objectKeys.map((key, idx) => {
                  if (
                    props.maxWidthColumn !== undefined &&
                    idx === props.maxWidthColumn
                  ) {
                    return (
                      <td className="px-6 py-4 w-full text-sm leading-5 font-medium text-gray-900">
                        {med[key]}
                      </td>
                    );
                  }

                  return (
                    <td className="px-6 py-4 text-sm leading-5 text-gray-900">
                      {med[key]}
                    </td>
                  );
                })}
                {props.actions && (
                  <td className="px-6">{props.actions(med)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="rounded-md shadow-sm">
          {props.list?.map?.((med: any, index: number) => (
            <AccordionV2
              title={
                <div className="grid">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium overflow-hidden text-ellipsis w-full text-left">
                      {med[props.objectKeys[0]]}
                    </h3>
                  </div>
                  <div className="flex gap-[160px] w-full mt-2">
                    {props.fieldsToDisplay?.map((i) => (
                      <div>
                        <h4 className="text-base font-semibold">
                          {props.theads[i]}
                        </h4>
                        {med[props.objectKeys[i]]}
                      </div>
                    ))}
                  </div>
                </div>
              }
              className={
                props.list.length - 1 === index
                  ? "bg-white p-5 "
                  : "bg-white p-5 border-b border-b-gray-400"
              }
              key={index}
            >
              <div className="flex flex-col w-full border-t border-t-gray-400 mt-3">
                <div className="grid grid-cols-2 gap-3 w-full mt-3">
                  {props.objectKeys.map((key, i) => {
                    if (i !== 0 && i !== props.objectKeys.length - 1)
                      return (
                        <div>
                          <h4 className="font-semibold text-base">
                            {props.theads[i]}
                          </h4>{" "}
                          <p>{med[key]}</p>
                        </div>
                      );

                    if (i === props.objectKeys.length - 1)
                      return (
                        <div className="col-span-2">
                          <h4 className="font-semibold text-base">
                            {props.theads[i]}
                          </h4>{" "}
                          <p>{med[key]}</p>
                        </div>
                      );
                  })}
                </div>
              </div>
            </AccordionV2>
          ))}
        </div>
      )}
    </>
  );
}
