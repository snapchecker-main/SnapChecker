import React from "react";
import Card from "../components/common/Card";
import { Info, AlertTriangle, Camera, CheckCircle2 } from "lucide-react";

export default function Help() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Help & Quick Start Guide
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Follow this step-by-step guide to set up your classrooms, create
          answer keys, and scan student papers.
        </p>
      </div>

      {/* Phase 1: Classroom & Roster Setup */}
      <Card>
        <div className="border-b border-gray-100 bg-gray-50/50 p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              1
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Classroom & Roster Setup
            </h2>
          </div>
        </div>
        <div className="space-y-6 p-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Create Your Workspace</h3>
            <p className="text-sm text-gray-600">
              From the <strong>Dashboard</strong>, click the red{" "}
              <strong>+ Add classroom</strong> button. Fill in your Subject and
              Academic Term to create a dedicated space for your class.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-900">Import Your Roster</h3>
            <p className="text-sm text-gray-600">
              Navigate to the <strong>Roster</strong> tab inside your new
              classroom. We highly recommend using the{" "}
              <strong>Upload CSV</strong> button for a bulk import. Ensure your
              spreadsheet has exactly two columns: <code>ID</code> followed by{" "}
              <code>Name</code>. You can also manually add students using the
              input fields or use the Edit/Remove buttons to manage existing
              records.
            </p>
          </div>
        </div>
      </Card>

      {/* Phase 2: Designing the Assessment */}
      <Card>
        <div className="border-b border-gray-100 bg-gray-50/50 p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              2
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Designing the Assessment
            </h2>
          </div>
        </div>
        <div className="space-y-6 p-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Initialize the Exam</h3>
            <p className="text-sm text-gray-600">
              Go to the <strong>Assessments</strong> tab and click{" "}
              <strong>+ New assessment</strong>. Name your exam and select the
              type (Quiz, Midterm, Final, etc.), then click Open Builder.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-900">Build the Layout</h3>
            <p className="text-sm text-gray-600">
              In the Design Layout workspace, drag and drop your Question Blocks
              and Student ID Grids onto the canvas.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-600"
                size={18}
              />
              <div>
                <strong>Critical Design Rules:</strong>
                <ul className="ml-5 mt-1 list-disc space-y-1">
                  <li>
                    Never place blocks outside the blue dotted margins (Scanner
                    Safe Zone).
                  </li>
                  <li>Do not allow any blocks to overlap each other.</li>
                  <li>Keep the red QR Code Zone completely clear.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-900">Set the Answer Key</h3>
            <p className="text-sm text-gray-600">
              Once the layout is saved, click the correct letter bubbles in the{" "}
              <strong>Answer Key Manager</strong> to tell the system how to
              grade the papers. Click <strong>Finish & Save</strong>. Your
              finalized assessment will now appear in the Assessments tab.
            </p>
          </div>
        </div>
      </Card>

      {/* Phase 3: Scanning & Processing Papers */}
      <Card>
        <div className="border-b border-gray-100 bg-gray-50/50 p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              3
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Scanning & Processing Papers
            </h2>
          </div>
        </div>
        <div className="space-y-6 p-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Upload Scans</h3>
            <p className="text-sm text-gray-600">
              Open your assessment and click the <strong>Grade Papers</strong>{" "}
              tab. You can drag and drop up to 50 image files per batch directly
              into the dropzone.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="flex items-center gap-2 font-medium text-gray-900">
              <Camera size={18} className="text-primary" /> Camera & Photography
              Guidelines
            </h3>
            <p className="text-sm text-gray-600">
              To ensure the computer vision model can accurately grade your
              papers, please follow these strict scanning rules:
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded border border-gray-100 bg-white p-4 shadow-sm">
                <CheckCircle2 size={16} className="mb-2 text-green-600" />
                <h4 className="text-xs font-bold text-gray-900">
                  Lighting & Surface
                </h4>
                <p className="mt-1 text-xs text-gray-600">
                  Ensure the room is well-lit to avoid harsh shadows across the
                  paper. Place the paper on a flat, light-colored surface for
                  contrast.
                </p>
              </div>
              <div className="rounded border border-gray-100 bg-white p-4 shadow-sm">
                <CheckCircle2 size={16} className="mb-2 text-green-600" />
                <h4 className="text-xs font-bold text-gray-900">
                  Alignment & Corners
                </h4>
                <p className="mt-1 text-xs text-gray-600">
                  All four black square corner markers MUST be fully visible in
                  the photo. Hold your camera directly above the paper, not at
                  an angle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Phase 4: Results & Analytics */}
      <Card>
        <div className="border-b border-gray-100 bg-gray-50/50 p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              4
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Results & Analytics
            </h2>
          </div>
        </div>
        <div className="space-y-6 p-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Review the Gradebook</h3>
            <p className="text-sm text-gray-600">
              Click the <strong>Gradebook</strong> tab to see the raw scores.
              You can filter the view by students who are <em>Missing</em>{" "}
              scores or papers that <em>Need Review</em> due to scanning issues.
              Use the <strong>Export results</strong> button to download the
              grades to your computer.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-900">Item Analysis</h3>
            <p className="text-sm text-gray-600">
              Once at least one paper is graded, the{" "}
              <strong>Item Analysis</strong> tab unlocks. This provides
              automated statistics to help you quickly identify which specific
              questions the majority of the class struggled with.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
