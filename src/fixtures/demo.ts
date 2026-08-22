import { z } from "zod";

const approvalSchema = z.enum(["draft", "approved", "rejected"]);

const boundingBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
});

const objectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  sourceImageId: z.string().min(1),
  groundingRecordId: z.string().min(1),
  boundingBox: boundingBoxSchema,
  approval: approvalSchema,
});

const groundingSchema = z.object({
  id: z.string().min(1),
  sourceImageId: z.string().min(1),
  modelObservation: z.string().min(1),
  caregiverValue: z.string().min(1),
  approval: approvalSchema,
});

const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "object_recognition",
    "location_matching",
    "visual_search",
    "visual_recall",
    "sequencing",
    "association",
  ]),
  prompt: z.string().min(1),
  correctAnswer: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2).max(3),
  objectIds: z.array(z.string().min(1)).min(1),
  groundingRecordIds: z.array(z.string().min(1)).min(1),
  verbalCue: z.string().min(1),
});

const demoFixtureSchema = z.object({
  patient: z.object({ firstName: z.string().min(1) }),
  room: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    imageSrc: z.string().startsWith("/"),
  }),
  objects: z.array(objectSchema).min(3).max(5),
  groundingRecords: z.array(groundingSchema).min(3),
  trustedPerson: z.object({
    name: z.string().min(1),
    relationship: z.string().min(1),
    referenceImageSrcs: z.array(z.string().startsWith("/")).min(2).max(3),
    guideImageSrc: z.string().startsWith("/"),
  }),
  questions: z.array(questionSchema).length(6),
});

export const demoFixture = demoFixtureSchema.parse({
  patient: { firstName: "Maya" },
  room: {
    id: "room-bedroom-1",
    name: "Bedroom",
    imageSrc: "/fixtures/bedroom.svg",
  },
  objects: [
    {
      id: "object-glasses",
      name: "Reading glasses",
      location: "bedside table",
      description: "Dark blue reading glasses",
      sourceImageId: "room-bedroom-1",
      groundingRecordId: "grounding-glasses",
      boundingBox: { x: 0.64, y: 0.55, width: 0.13, height: 0.08 },
      approval: "approved",
    },
    {
      id: "object-lamp",
      name: "Lamp",
      location: "bedside table",
      description: "Cream lamp with a green base",
      sourceImageId: "room-bedroom-1",
      groundingRecordId: "grounding-lamp",
      boundingBox: { x: 0.76, y: 0.2, width: 0.14, height: 0.36 },
      approval: "approved",
    },
    {
      id: "object-mug",
      name: "Blue mug",
      location: "dresser",
      description: "Small blue ceramic mug",
      sourceImageId: "room-bedroom-1",
      groundingRecordId: "grounding-mug",
      boundingBox: { x: 0.18, y: 0.46, width: 0.1, height: 0.14 },
      approval: "approved",
    },
  ],
  groundingRecords: [
    {
      id: "grounding-glasses",
      sourceImageId: "room-bedroom-1",
      modelObservation: "Dark glasses are visible on the table beside the bed.",
      caregiverValue: "Reading glasses on the bedside table",
      approval: "approved",
    },
    {
      id: "grounding-lamp",
      sourceImageId: "room-bedroom-1",
      modelObservation: "A lamp is visible on the table beside the bed.",
      caregiverValue: "Lamp on the bedside table",
      approval: "approved",
    },
    {
      id: "grounding-mug",
      sourceImageId: "room-bedroom-1",
      modelObservation: "A blue mug is visible on the dresser.",
      caregiverValue: "Blue mug on the dresser",
      approval: "approved",
    },
  ],
  trustedPerson: {
    name: "Elena",
    relationship: "daughter",
    referenceImageSrcs: [
      "/fixtures/elena-reference-1.svg",
      "/fixtures/elena-reference-2.svg",
    ],
    guideImageSrc: "/fixtures/elena-guide.svg",
  },
  questions: [
    {
      id: "question-1",
      type: "object_recognition",
      prompt: "Which item helps with reading?",
      correctAnswer: "Reading glasses",
      choices: ["Reading glasses", "Blue mug", "Lamp"],
      objectIds: ["object-glasses"],
      groundingRecordIds: ["grounding-glasses"],
      verbalCue: "Look for something you can wear.",
    },
    {
      id: "question-2",
      type: "location_matching",
      prompt: "Where are the reading glasses?",
      correctAnswer: "On the bedside table",
      choices: ["On the bedside table", "On the bed", "On the dresser"],
      objectIds: ["object-glasses"],
      groundingRecordIds: ["grounding-glasses"],
      verbalCue: "Look beside the bed.",
    },
    {
      id: "question-3",
      type: "visual_search",
      prompt: "Can you find the blue mug?",
      correctAnswer: "On the dresser",
      choices: ["On the dresser", "On the bed", "By the window"],
      objectIds: ["object-mug"],
      groundingRecordIds: ["grounding-mug"],
      verbalCue: "Look toward the left side of the room.",
    },
    {
      id: "question-4",
      type: "object_recognition",
      prompt: "Which object gives light?",
      correctAnswer: "Lamp",
      choices: ["Lamp", "Blue mug", "Reading glasses"],
      objectIds: ["object-lamp"],
      groundingRecordIds: ["grounding-lamp"],
      verbalCue: "It is above the bedside table.",
    },
    {
      id: "question-5",
      type: "visual_recall",
      prompt: "Which object did you see beside the bed?",
      correctAnswer: "Reading glasses",
      choices: ["Reading glasses", "Blue mug", "Pillow"],
      objectIds: ["object-glasses"],
      groundingRecordIds: ["grounding-glasses"],
      verbalCue: "It is something you can wear.",
    },
    {
      id: "question-6",
      type: "association",
      prompt: "Which object can hold a warm drink?",
      correctAnswer: "Blue mug",
      choices: ["Blue mug", "Lamp", "Reading glasses"],
      objectIds: ["object-mug"],
      groundingRecordIds: ["grounding-mug"],
      verbalCue: "It has a handle.",
    },
  ],
});

export type DemoFixture = z.infer<typeof demoFixtureSchema>;
