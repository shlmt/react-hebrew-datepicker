import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoCalendarOutline } from "react-icons/io5";
import { HDate } from "@hebcal/core";
import './HebrewDatePicker.css';
import CalendarPopup from "./CalendarPopup";

const HebrewDatePicker = ({ name, value, defaultValue, onChange, required, label = "בחר תאריך", usePortal = false, dir = "rtl", isRange = false, valueStart, valueEnd, onChangeRange }) => {
  // Support both controlled and uncontrolled modes
  const isControlled = value !== undefined || (isRange && (valueStart !== undefined || valueEnd !== undefined));
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [internalRangeStart, setInternalRangeStart] = useState(null);
  const [internalRangeEnd, setInternalRangeEnd] = useState(null);
  const currentValue = isControlled ? value : internalValue;

  const showDate = currentValue ? new Date(currentValue) : new Date();
  const selectedHDate = new HDate(showDate);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentHDate, setCurrentHDate] = useState(selectedHDate);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [calendarPos, setCalendarPos] = useState({ top: 0, left: 0 });
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  const popupRef = useRef(null);
  const inputRef = useRef();

  const [transitionDirection, setTransitionDirection] = useState("forward");

  // Range state
  const rangeStart = isRange && valueStart ? valueStart : internalRangeStart;
  const rangeEnd = isRange && valueEnd ? valueEnd : internalRangeEnd;

  // Update selectedHDate when value changes (for controlled mode)
  useEffect(() => {
    if (isRange) {
      if (valueStart) {
        const newDate = new Date(valueStart);
        const newHDate = new HDate(newDate);
        setCurrentHDate(newHDate);
      }
    } else if (isControlled && value) {
      const newDate = new Date(value);
      const newHDate = new HDate(newDate);
      setCurrentHDate(newHDate);
    } else if (!isControlled && internalValue) {
      const newDate = new Date(internalValue);
      const newHDate = new HDate(newDate);
      setCurrentHDate(newHDate);
    }
  }, [value, internalValue, isControlled, isRange, valueStart]);

  // Internal change handler
  const handleDateChange = (event) => {
    const newValue = event.target.value;

    if (isRange) {
      if (!isSelectingEnd && !rangeStart) {
        // First selection - start date
        setInternalRangeStart(newValue);
        setIsSelectingEnd(true);
      } else if (!isSelectingEnd) {
        // After start is selected, allow end date selection
        setIsSelectingEnd(true);
      } else {
        // Second selection - end date
        const start = rangeStart;
        const end = newValue;
        // Ensure start is before end
        const [finalStart, finalEnd] = new Date(start) <= new Date(end) 
          ? [start, end] 
          : [end, start];
        
        if (!isControlled) {
          setInternalRangeStart(finalStart);
          setInternalRangeEnd(finalEnd);
        }

        if (onChangeRange) {
          onChangeRange({ start: finalStart, end: finalEnd });
        }
        
        setShowCalendar(false);
        setIsSelectingEnd(false);
      }
    } else {
      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Call external onChange if provided
      if (onChange) {
        onChange(event);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowCalendar(false);
        setShowMonthYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showCalendar && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const calendarWidth = 320; // Width defined in CalendarPopup
      const leftPosition = rect.left + window.scrollX + (rect.width - calendarWidth) / 2;

      setCalendarPos({
        top: rect.bottom + window.scrollY + 8,
        left: Math.max(10, leftPosition), // Ensure it doesn't go off-screen
      });
    }
  }, [showCalendar]);

  return (
    <div style={{ position: "relative", maxWidth: 360, margin: "auto", fontFamily: "Arial, sans-serif" }} dir={dir}>
      <label htmlFor={name} style={{ display: "block", marginBottom: 6 }}>{label}{required && " *"}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          id={name}
          name={name}
          readOnly
          required={required}
          value={isRange ? (
            rangeStart && rangeEnd 
              ? `${formatHebrewDate(new HDate(new Date(rangeStart)))} - ${formatHebrewDate(new HDate(new Date(rangeEnd)))}`
              : rangeStart
              ? `מ: ${formatHebrewDate(new HDate(new Date(rangeStart)))}${isSelectingEnd ? ' (בחר תאריך סיום)' : ''}`
              : ''
          ) : (
            currentValue ? formatHebrewDate(selectedHDate) : ""
          )}
          placeholder={isRange ? "בחר טווח תאריכים" : "בחר תאריך עברי"}
          style={{ padding: 10, borderRadius: 5, border: "1px solid #ccc", width: "100%", backgroundColor: "white", color: "#444", fontWeight: "bold", cursor: "default" }}
          onClick={() => setShowCalendar((v) => !v)}
        />
        <button
          onClick={() => setShowCalendar((v) => !v)}
          type="button"
          style={{ cursor: "pointer", padding: 8, color: "#4da6ff", border: "none", borderRadius: 6, background: "none", fontSize: 22 }}
        ><IoCalendarOutline /></button>
      </div>

      {showCalendar && (
        usePortal
          ? createPortal(
            <CalendarPopup
              popupRef={popupRef}
              calendarPos={calendarPos}
              currentHDate={currentHDate}
              selectedHDate={selectedHDate}
              onChange={handleDateChange}
              setShowCalendar={setShowCalendar}
              setCurrentHDate={setCurrentHDate}
              setShowMonthYearPicker={setShowMonthYearPicker}
              showMonthYearPicker={showMonthYearPicker}
              transitionDirection={transitionDirection}
              setTransitionDirection={setTransitionDirection}
              name={name}
              isRange={isRange}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              isSelectingEnd={isSelectingEnd}
              onClearRange={() => {
                setInternalRangeStart(null);
                setInternalRangeEnd(null);
                setIsSelectingEnd(false);
                if (onChangeRange) {
                  onChangeRange({ start: null, end: null });
                }
              }}
            />,
            document.body
          )
          :
          <CalendarPopup
            popupRef={popupRef}
            calendarPos={{ top: "calc(100% + 8px)", left: 0 }}
            currentHDate={currentHDate}
            selectedHDate={selectedHDate}
            onChange={handleDateChange}
            setShowCalendar={setShowCalendar}
            setCurrentHDate={setCurrentHDate}
            setShowMonthYearPicker={setShowMonthYearPicker}
            showMonthYearPicker={showMonthYearPicker}
            transitionDirection={transitionDirection}
            setTransitionDirection={setTransitionDirection}
            name={name}
            isRange={isRange}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            isSelectingEnd={isSelectingEnd}
            onClearRange={() => {
              setInternalRangeStart(null);
              setInternalRangeEnd(null);
              setIsSelectingEnd(false);
              if (onChangeRange) {
                onChangeRange({ start: null, end: null });
              }
            }}
          />

      )}
    </div>
  );
};

const hebrewMonths = [
  "ניסן", "אייר", "סיוון", "תמוז", "אב", "אלול",
  "תשרי", "חשוון", "כסלו", "טבת", "שבט", "אדר א׳", "אדר ב׳"
];

const hebrewNumber = (num) => {
  const hebrewDigits = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"];
  const tens = ["", "י", "כ", "ל"];
  if (num === 15) return "טו";
  if (num === 16) return "טז";
  if (num <= 10) return hebrewDigits[num];
  if (num < 20) return "י" + hebrewDigits[num - 10];
  if (num <= 30) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + hebrewDigits[unit];
  }
  return num;
};

const formatHebrewDate = (hdate) => {
  try {
    const day = hdate.getDate();
    let monthIndex = hdate.getMonth() - 1;
    if (monthIndex === 11 && !hdate.isLeapYear()) monthIndex = 11;
    else if (monthIndex === 12 && !hdate.isLeapYear()) monthIndex = 11;
    const month = hebrewMonths[monthIndex] || "";
    const year = hdate.renderGematriya().split(" ").pop();
    return `${hebrewNumber(day)} ${month} ${year}`;
  } catch (e) {
    console.error('Error formatting Hebrew date:', e);
    return 'שגיאה בתאריך';
  }
};

export default HebrewDatePicker;
