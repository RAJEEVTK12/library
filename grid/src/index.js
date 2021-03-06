import React, { forwardRef, useImperativeHandle, useMemo, useState, useEffect } from "react";
import Customgrid from "./Customgrid";

const Grid = forwardRef((props, ref) => {
    const {
        title,
        gridHeight,
        gridWidth,
        columns,
        fetchData,
        rowEditOverlay,
        rowEditData,
        updateRowData,
        deletePopUpOverLay,
        deleteRowData,
        globalSearchLogic,
        selectBulkData,
        calculateRowHeight,
        renderExpandedContent
    } = props;

    //Set state value for variable to check if there is anext page available
    const [hasNextPage, setHasNextPage] = useState(true);
    //Set state value for variable to check if the loading process is going on
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    //Local state value for checking if data is being loaded from API
    const [isLoading, setIsLoading] = useState(false);
    //Set state value for variable to hold grid data
    const [items, setItems] = useState([]);
    //Local state for group sort options
    const [groupSortOptions, setGroupSortOptions] = useState([]);

    let processedColumns = [];
    columns.forEach((column, index) => {
        const { innerCells, accessor, sortValue } = column;
        const isInnerCellsPresent = innerCells && innerCells.length > 0;

        //Add column Id
        column.columnId = `column_${index}`;

        //Add logic to sort column if sort is not disabled
        if (!column.disableSortBy) {
            if (isInnerCellsPresent) {
                //If there are inner cells and a sort value specified, do sort on that value
                if (sortValue) {
                    column.sortType = (rowA, rowB) => {
                        return rowA.original[accessor][sortValue] > rowB.original[accessor][sortValue] ? -1 : 1;
                    };
                } else {
                    column.disableSortBy = true;
                }
            } else if (!innerCells) {
                //If no inner cells are there, just do sort on column value
                column.sortType = (rowA, rowB) => {
                    return rowA.original[accessor] > rowB.original[accessor] ? -1 : 1;
                };
            }
        }

        //Add logic to filter column if column filter is not disabled
        if (!column.disableFilters) {
            if (isInnerCellsPresent) {
                column.filter = (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        const filterCols = innerCells.filter((cell) => {
                            const cellValue = rowValue[cell.accessor] ? rowValue[cell.accessor].toString().toLowerCase() : "";
                            return cellValue.includes(filterText);
                        });
                        return filterCols && filterCols.length > 0;
                    });
                };
            }
        }

        processedColumns.push(column);
    });
    const gridColumns = useMemo(() => processedColumns, []);

    //Function to return sorting logic based on the user selected order of sort
    const compareValues = (compareOrder, v1, v2) => {
        if (compareOrder === "Ascending") {
            return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
        } else {
            return v1 < v2 ? 1 : v1 > v2 ? -1 : 0;
        }
    };
    //Function to return sorted data
    const getSortedData = (originalData) => {
        return originalData.sort(function (x, y) {
            let compareResult = 0;
            groupSortOptions.forEach((option) => {
                const { sortBy, sortOn, order } = option;
                const newResult =
                    sortOn === "value"
                        ? compareValues(order, x[sortBy], y[sortBy])
                        : compareValues(order, x[sortBy][sortOn], y[sortBy][sortOn]);
                compareResult = compareResult || newResult;
            });
            return compareResult;
        });
    };
    //Function to find correct index from original data using index from sorted data
    const getOriginalDataIndex = (sortedDataIndex) => {
        const updatedData = getSortedData([...items]).find((item, index) => {
            return index === sortedDataIndex;
        });
        let originalDataIndex = -1;
        originalDataIndex = items.findIndex((item, index) => {
            return item === updatedData;
        });
        return originalDataIndex;
    };

    //Gets triggered when a cell in grid is updated
    useImperativeHandle(ref, () => ({
        updateCellInGrid(rowIndex, columnId, value) {
            const originalDataIndex = getOriginalDataIndex(rowIndex);
            if (originalDataIndex >= 0) {
                setItems((old) =>
                    old.map((row, index) => {
                        if (index === originalDataIndex) {
                            return {
                                ...old[originalDataIndex],
                                [columnId]: value
                            };
                        }
                        return row;
                    })
                );
            }
        }
    }));

    //Gets triggered when one row item is updated
    const updateRowInGrid = (rowIndex, updatedRow) => {
        setItems((old) =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    row = updatedRow;
                }
                return row;
            })
        );
        updateRowData(updatedRow);
    };

    //Gets triggered when one row item is deleted
    const deleteRowFromGrid = (rowIndexToBeDeleted, deletedRow) => {
        setItems((old) =>
            old.filter((row, index) => {
                return index !== rowIndexToBeDeleted;
            })
        );
        deleteRowData(deletedRow);
    };

    //Gets called when group sort is applied or cleared
    const doGroupSort = (sortOptions) => {
        setGroupSortOptions(sortOptions);
    };

    //Gets called when page scroll reaches the bottom of the grid.
    //Fetch the next set of data and append it to the variable holding grid data and update the state value.
    //Also update the hasNextPage state value to False once API response is empty, to avoid unwanted API calls.
    const loadNextPage = (...args) => {
        const newIndex = args && args.length > 0 ? args[0] : -1;
        if (newIndex >= 0 && hasNextPage) {
            setIsLoading(true);
            setIsNextPageLoading(true);
            fetchData(newIndex).then((data) => {
                setIsLoading(false);
                setHasNextPage(data && data.length > 0);
                setIsNextPageLoading(false);
                setItems(items.concat(data));
            });
        }
    };

    useEffect(() => {
        //Make API call to fetch initial set of data.
        setIsLoading(true);
        fetchData(0).then((data) => {
            setIsLoading(false);
            setItems(data);
        });
    }, []);

    //Sort the data based on the user selected group sort optipons
    const data = getSortedData([...items]);

    if (data && data.length > 0) {
        return (
            <div>
                <Customgrid
                    title={title}
                    gridHeight={gridHeight}
                    gridWidth={gridWidth}
                    managableColumns={gridColumns}
                    originalColumns={gridColumns}
                    data={data}
                    originalData={items}
                    rowEditOverlay={rowEditOverlay}
                    rowEditData={rowEditData}
                    updateRowInGrid={updateRowInGrid}
                    deletePopUpOverLay={deletePopUpOverLay}
                    deleteRowFromGrid={deleteRowFromGrid}
                    globalSearchLogic={globalSearchLogic}
                    selectBulkData={selectBulkData}
                    calculateRowHeight={calculateRowHeight}
                    renderExpandedContent={renderExpandedContent}
                    hasNextPage={hasNextPage}
                    isNextPageLoading={isNextPageLoading}
                    loadNextPage={loadNextPage}
                    doGroupSort={doGroupSort}
                />
                {isNextPageLoading ? <h2 style={{ textAlign: "center" }}>Loading...</h2> : null}
            </div>
        );
    } else if (isLoading) {
        return <h2 style={{ textAlign: "center", marginTop: "70px" }}>Initializing Grid...</h2>;
    } else {
        return <h2 style={{ textAlign: "center", marginTop: "70px" }}>Invalid Data or Column Configurations</h2>;
    }
});

export default Grid;
