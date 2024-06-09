import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dispatch, SetStateAction } from "react";

interface CrippledWarningDialog {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const CrippledWarningDialog: React.FC<CrippledWarningDialog> = ({
  open,
  setOpen,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="dark">
        <DialogHeader>
          <DialogTitle>Warning ⚠️</DialogTitle>
          <DialogDescription>
            FP16 accumulation is rarely (if ever) used in DL code. <br />
            FP32 accum is locked-in as an immutable default by PyTorch, and FP16
            accum is difficult to use outside of inference encountering
            precision problems.
            <br />
            <br />
            Keep this in mind when reading the changed values.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            Alright
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
