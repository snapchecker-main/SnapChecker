import { create } from "zustand";
import api from "../api/client";
import { classroomApi } from "../api/services/classroomApi";

const DEFAULT_TEMPLATE = {
  name: "",
  examType: "Quiz",
  numItems: "",
  numChoices: "",
};

const useAppStore = create((set, get) => ({
  selectedTemplateId: null,
  isScanning: false,
  draftTemplate: { ...DEFAULT_TEMPLATE },

  classrooms: [],
  hasFetchedClassrooms: false,

  fetchClassrooms: async () => {
    const { hasFetchedClassrooms } = get();
    if (hasFetchedClassrooms) return;

    try {
      const data = await classroomApi.getAll();
      set({ classrooms: data, hasFetchedClassrooms: true });
    } catch (error) {
      // Errors handled silently; Toast UI interceptor takes care of the user
    }
  },

  addClassroom: (newClass) =>
    set((state) => ({ classrooms: [newClass, ...state.classrooms] })),

  removeClassroom: (id) =>
    set((state) => ({
      classrooms: state.classrooms.filter((c) => c.id !== id),
    })),

  updateClassroomInStore: (updatedClass) =>
    set((state) => ({
      classrooms: state.classrooms.map((c) =>
        c.id === updatedClass.id ? updatedClass : c,
      ),
    })),

  saveExamSettings: async (classroomId) => {
    const { draftTemplate, selectedTemplateId } = get();

    const payload = {
      name: draftTemplate.name.trim(),
      examType: draftTemplate.examType,
      numItems: Number(draftTemplate.numItems),
      numChoices: Number(draftTemplate.numChoices),
      classroom_id: classroomId,
    };

    try {
      let template;
      if (selectedTemplateId) {
        const response = await api.put(
          `/templates/${selectedTemplateId}`,
          payload,
        );
        template = response.data;
      } else {
        const response = await api.post("/templates/", payload);
        template = response.data;
      }
      set({ selectedTemplateId: template.id });
      return template;
    } catch (error) {
      throw error;
    }
  },

  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
  setIsScanning: (status) => set({ isScanning: status }),
  updateDraftTemplate: (updates) =>
    set((state) => ({ draftTemplate: { ...state.draftTemplate, ...updates } })),
  clearDraftTemplate: () => set({ draftTemplate: { ...DEFAULT_TEMPLATE } }),
}));

export default useAppStore;
