import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Student,
  StudentCreateRequest,
  StudentUpdateRequest,
  type StudentPhoneNumber,
} from '../services/students.service';

interface StudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (data: StudentCreateRequest | StudentUpdateRequest) => Promise<void>;
  isLoading: boolean;
}

type PhoneDraft = {
  ddd: string;
  number: string;
  description: string;
};

const emptyForm: StudentCreateRequest = {
  name: '',
  enrollment: '',
  email: '',
  courseCurriculum: '',
  phoneNumbers: [],
  classes: [],
};

const emptyPhoneDraft: PhoneDraft = {
  ddd: '',
  number: '',
  description: '',
};

export function StudentsModal({
  open,
  onOpenChange,
  student,
  onSave,
  isLoading,
}: StudentsModalProps) {
  const [formData, setFormData] = useState<StudentCreateRequest>(emptyForm);
  const [phoneDraft, setPhoneDraft] = useState<PhoneDraft>(emptyPhoneDraft);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        enrollment: student.enrollment || '',
        email: student.email || '',
        courseCurriculum: student.courseCurriculum ?? student.course_curriculum ?? '',
        phoneNumbers: student.phoneNumbers ?? [],
        classes: student.classes ?? [],
      });
    } else {
      setFormData(emptyForm);
      setPhoneDraft(emptyPhoneDraft);
    }
  }, [student, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleAddPhone = () => {
    const trimmedDdd = phoneDraft.ddd.trim();
    const trimmedNumber = phoneDraft.number.trim();

    if (!trimmedDdd || !trimmedNumber) {
      return;
    }

    const ddd = Number.parseInt(trimmedDdd, 10);
    const number = Number.parseInt(trimmedNumber, 10);

    if (Number.isNaN(ddd) || Number.isNaN(number)) {
      return;
    }

    const newPhone: StudentPhoneNumber = {
      ddd,
      number,
      description: phoneDraft.description.trim() || undefined,
    };

    setFormData((prev) => ({
      ...prev,
      phoneNumbers: [...(prev.phoneNumbers ?? []), newPhone],
    }));

    setPhoneDraft(emptyPhoneDraft);
  };

  const handleRemovePhone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers?.filter((_, i) => i !== index) ?? [],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Editar Estudante' : 'Novo Estudante'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="enrollment">Matrícula</Label>
              <Input
                id="enrollment"
                value={formData.enrollment}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    enrollment: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="courseCurriculum">Currículo</Label>
              <Input
                id="courseCurriculum"
                value={formData.courseCurriculum ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    courseCurriculum: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Telefones</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="phone-ddd" className="text-xs text-muted-foreground">
                    DDD
                  </Label>
                  <Input
                    id="phone-ddd"
                    placeholder="51"
                    value={phoneDraft.ddd}
                    onChange={(e) =>
                      setPhoneDraft((prev) => ({
                        ...prev,
                        ddd: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="phone-number" className="text-xs text-muted-foreground">
                    Número
                  </Label>
                  <Input
                    id="phone-number"
                    placeholder="99999999"
                    value={phoneDraft.number}
                    onChange={(e) =>
                      setPhoneDraft((prev) => ({
                        ...prev,
                        number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="phone-description" className="text-xs text-muted-foreground">
                    Descrição
                  </Label>
                  <Input
                    id="phone-description"
                    placeholder="Ex.: Celular"
                    value={phoneDraft.description}
                    onChange={(e) =>
                      setPhoneDraft((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-2">
                <Button type="button" variant="outline" onClick={handleAddPhone}>
                  Adicionar telefone
                </Button>
              </div>
              {formData.phoneNumbers && formData.phoneNumbers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.phoneNumbers.map((phone, index) => (
                    <div
                      key={`${phone.ddd}-${phone.number}-${index}`}
                      className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-md text-sm"
                    >
                      <span>
                        ({phone.ddd}) {String(phone.number).replace(/(\d{4})(\d{4})/, '$1-$2')}
                        {phone.description ? ` - ${phone.description}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhone(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
