// TEST ONLY - remove after Phase 1
import { useState } from 'react';
import { Button } from 'antd';
import { BottomSheet } from './BottomSheet';

export function BottomSheetPage() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: '#FDF6EC',
        minHeight: '100vh',
        padding: 20,
        direction: 'rtl',
      }}
      data-testid="bottom-sheet-page"
    >
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        data-testid="open-button"
      >
        פתח גיליון
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="הוסף אורח"
      >
        <div data-testid="sheet-content" style={{ padding: '16px 0' }}>
          <p>תוכן גיליון לדוגמה</p>
        </div>
      </BottomSheet>
    </div>
  );
}
