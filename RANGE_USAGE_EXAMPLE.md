# Hebrew Date Picker - Range Selection

## תמיכה בבחירת טווח תאריכים (Range Selection)

### דוגמה בשימוש בלא שליטה (Uncontrolled):

```jsx
import HebrewDatePicker from './HebrewDatePicker';

export function MyComponent() {
  const handleRangeChange = ({ start, end }) => {
    console.log('Start:', start, 'End:', end);
  };

  return (
    <HebrewDatePicker
      name="dateRange"
      isRange={true}
      label="בחר טווח תאריכים"
      onChangeRange={handleRangeChange}
    />
  );
}
```

### דוגמה בשימוש בשליטה (Controlled):

```jsx
import HebrewDatePicker from './HebrewDatePicker';
import { useState } from 'react';

export function MyComponent() {
  const [rangeStart, setRangeStart] = useState('2024-01-01');
  const [rangeEnd, setRangeEnd] = useState('2024-01-15');

  const handleRangeChange = ({ start, end }) => {
    setRangeStart(start);
    setRangeEnd(end);
  };

  return (
    <HebrewDatePicker
      name="dateRange"
      isRange={true}
      valueStart={rangeStart}
      valueEnd={rangeEnd}
      label="בחר טווח תאריכים"
      onChangeRange={handleRangeChange}
    />
  );
}
```

### דוגמה לבחירת תאריך יחיד (Single Date - ברירת מחדל):

```jsx
import HebrewDatePicker from './HebrewDatePicker';

export function MyComponent() {
  const handleChange = (event) => {
    console.log('Selected date:', event.target.value);
  };

  return (
    <HebrewDatePicker
      name="singleDate"
      label="בחר תאריך"
      onChange={handleChange}
    />
  );
}
```

## תכונות החדשות:

### Props:
- **isRange** (boolean): הפעל מצב בחירת טווח. ברירת מחדל: `false`
- **valueStart** (string): תאריך התחלת הטווח (ISO format: YYYY-MM-DD)
- **valueEnd** (string): תאריך סיום הטווח (ISO format: YYYY-MM-DD)
- **onChangeRange** (function): קריאה אחזור כאשר בחרת טווח `{ start, end }`

### התנהגות:
1. בכניסה למצב טווח, בחר תחילה את תאריך ההתחלה
2. לאחר מכן, בחר את תאריך הסיום
3. כל התאריכים בין התחלה לסוף מודגשים בצבע קל (#e6f2ff)
4. תאריכי הגבול (התחלה וסוף) מודגשים בכחול (#4da6ff)
5. ניתן לבחור תאריכים מחודשים שונים - טווח יתחיל מיום מוקדם לאחרון
6. כפתור "נקה טווח" מנקה את הבחירה כולה

### סגנון:
- תאריכים בטווח: רקע בצבע תכלת קל
- תאריכי גבול: רקע כחול מלא עם טקסט לבן
- ממשק משתמש אינטואיטיבי עם הודעות בעברית
