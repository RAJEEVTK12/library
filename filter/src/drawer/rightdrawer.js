import React, { forwardRef, useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import AutoComplete from "../types/AutoCompleteComponent";
import FieldComponent from "../types/DateTimeComponent";
import Condition from "../types/ConditionalComponent";
import TextComponents from "../types/TextComponents";
import saveLogo from "../images/icon-save.svg";

const RightDrawer = forwardRef((props, ref) => {
  const [showSavePopup, setShowSavePopup] = useState("none");
  const [saveFilterName, setSaveFilterName] = useState("");
  const [saveFilterWarning, setSaveFilterWarning] = useState("");
  const [warningLabel, setWarningLabel] = useState("");

  useEffect(() => {
    setWarningLabel(props.saveWarningClassName);
    setSaveFilterWarning(props.saveWarningLabel);
    setShowSavePopup(props.showSavePopUp);
  }, [props.saveWarningClassName, props.saveWarningLabel, props.showSavePopUp]);
  /**
   * Method To pass the required name of the filter required to be saved
   * @param {*} e is event triggered when typing on the to-save filter name field
   */
  const registersaveFilterName = (e) => {
    setSaveFilterName(e.target.value);
  };
  /**
   * Method To show the save popup
   */
  const showPopUp = () => {
    setShowSavePopup("");
  };
  /**
   * Method To close the save popup
   */
  const cancelSavePopup = () => {
    setShowSavePopup("none");
    setSaveFilterWarning("");
    setWarningLabel("");
  };
  return (
    <React.Fragment>
      <div className="filter__title">
        Searched Filters
        <span className="filter-count">{props.filterCount}</span>
      </div>
      <div className="filter__content">
        <AutoComplete
          name={props.name}
          type={props.type}
          enabled={props.enabled}
          dataType={props.dataType}
          options={props.options}
          autoCompleteArray={props.autoCompleteArray}
          deleteAutoCompleteElement={props.deleteAutoCompleteElement}
          handleAutoCompleteEnabled={props.handleAutoCompleteEnabled}
          createAutoCompleteArray={props.createAutoCompleteArray}
        />
        <FieldComponent
          dateTimesArray={props.dateTimesArray}
          deleteDateTimeElement={props.deleteDateTimeElement}
          handleDateTimeEnabled={props.handleDateTimeEnabled}
          createDateTimeArray={props.createDateTimeArray}
          addToday={props.addToday}
          addTomorrow={props.addTomorrow}
          addThisMonth={props.addThisMonth}
          addForteenDays={props.addForteenDays}
          addSevenDays={props.addSevenDays}
          addThisWeek={props.addThisWeek}
          addThirtyDays={props.addThirtyDays}
          lastDayChange={props.lastDayChange}
          nextDayChange={props.nextDayChange}
        />
        <Condition
          conditionsArray={props.conditionsArray}
          handleCondionalEnabled={props.handleCondionalEnabled}
          createConditionalArray={props.createConditionalArray}
          deleteConditionalElement={props.deleteConditionalElement}
        />
        <TextComponents
          textComponentsArray={props.textComponentsArray}
          deleteTextComponentElement={props.deleteTextComponentElement}
          createTextComponentsArray={props.createTextComponentsArray}
          handleTextComponentEnabled={props.handleTextComponentEnabled}
        />
      </div>
      <div className="filter__btn">
        <div className="filter__save">
          <Button className="button-save" variant="">
            <img src={saveLogo} onClick={showPopUp} alt="save icon" />
            <span>SAVE</span>
          </Button>
        </div>
        <div className="btn-wrap">
          <Button variant="" className="reset" onClick={props.resetDrawer}>
            Reset
          </Button>
          <Button
            variant=""
            className="applyFilter"
            onClick={(e) => {
              props.applyFilter();
              props.deleteAutoCompleteElement({});
              props.deleteConditionalElement({});
              props.deleteDateTimeElement({});
              props.deleteTextComponentElement({});
              props.closeDrawer();
            }}
          >
            Apply Filter
          </Button>
        </div>
        <div style={{ display: showSavePopup }} className="popup--save">
          <h5>Save the Filter</h5>
          <span className={warningLabel}>{saveFilterWarning}</span>
          <label>Saved Filter Name</label>
          <input
            className="txt"
            value={saveFilterName}
            onChange={(e) => registersaveFilterName(e)}
          />
          <div className="btn-wrap">
            <button
              className="button"
              onClick={(e) => {
                cancelSavePopup();
              }}
            >
              Cancel
            </button>
            <button
              className="button"
              onClick={(e) => {
                props.saveFilter(saveFilterName);
                // setSaveFilterName("");
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});

export default RightDrawer;
