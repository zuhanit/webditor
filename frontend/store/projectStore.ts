import { Project, ProjectSchema } from "@/types/schemas/project/Project";
import { create } from "zustand";

export interface ProjectState {
  project: Project | null;
}

export interface ProjectActions {
  /**
   * Open Webditor Project from .wproject extension file.
   * @param file Webditor Project File (.wproject)
   * @returns Open Result
   */
  openProject: (file: File) => Promise<boolean>;
  /**
   * Set project state from passed project object.
   * @param project
   */
  setProject: (project: Project) => void;
}

export type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()((set) => ({
  project: null,
  openProject: async (file: File) => {
    try {
      const parseResult = ProjectSchema.parse(
        JSON.stringify(await file.text()),
      );
      set({ project: parseResult });
      return true;
    } catch (err) {
      alert(`Failed to open project ${file.name}: ${err}`);
      return false;
    }
  },
  setProject: (project: Project) => set({ project: project }),
}));
