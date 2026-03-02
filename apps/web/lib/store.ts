// Shared types and mock state for the LabelForge app

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "member";
};

export type Project = {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  createdAt: string;
  taskCount: number;
  memberCount: number;
  ownerId: string;
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "CONFIRMED";

export type Task = {
  id: string;
  projectId: string;
  fileName: string;
  imageUrl: string;
  status: TaskStatus;
  assignee: string;
  annotationCount: number;
  createdAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
};

export type Annotation = {
  id: string;
  taskId: string;
  label: string;
  type: "bbox" | "polygon";
  points: { x: number; y: number }[];
  color: string;
  confidence?: number;
  createdBy: string;
};

export type ModelVersion = {
  id: string;
  projectId: string;
  name: string;
  baseModel: string;
  status: "QUEUED" | "RUNNING" | "SUCCESS" | "FAIL";
  isActive: boolean;
  isGlobalDefault: boolean;
  modelType: "base" | "fine-tuned";
  mAP: number | null;
  trainedAt: string;
  confirmedTasksUsed: number;
};

export type ProjectRole = "OWNER" | "PARTICIPANT";

export type ProjectMember = {
  id: string;
  name: string;
  email: string;
  role: ProjectRole;
  joinedAt: string;
  avatar: string;
};

export type UploadFile = {
  id: string;
  name: string;
  size: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
};

export const LABEL_COLORS: Record<string, string> = {
  person: "#3B82F6",
  car: "#0D9488",
  dog: "#F59E0B",
  cat: "#EF4444",
  bicycle: "#8B5CF6",
  tree: "#22C55E",
};

export const MOCK_USER: User = {
  id: "u1",
  name: "Alex Kim",
  email: "alex@labelforge.ai",
  avatar: "AK",
  role: "owner",
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Urban Traffic Detection",
    description:
      "Annotate vehicles and pedestrians in urban scenes for autonomous driving model training.",
    inviteCode: "URBAN-2026",
    createdAt: "2026-01-15",
    taskCount: 48,
    memberCount: 5,
    ownerId: "u1",
  },
  {
    id: "p2",
    name: "Wildlife Monitoring",
    description:
      "Label animal species in trail camera footage for conservation research.",
    inviteCode: "WILD-2026",
    createdAt: "2026-02-01",
    taskCount: 23,
    memberCount: 3,
    ownerId: "u2",
  },
  {
    id: "p3",
    name: "Retail Shelf Audit",
    description:
      "Detect and classify products on retail shelves for inventory management.",
    inviteCode: "RETAIL-2026",
    createdAt: "2026-02-10",
    taskCount: 12,
    memberCount: 2,
    ownerId: "u1",
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    fileName: "intersection_001.jpg",
    imageUrl: "/mock/intersection_001.jpg",
    status: "CONFIRMED",
    assignee: "Alex Kim",
    annotationCount: 12,
    createdAt: "2026-01-16",
    confirmedBy: "Alex Kim",
    confirmedAt: "2026-01-20",
  },
  {
    id: "t2",
    projectId: "p1",
    fileName: "highway_002.jpg",
    imageUrl: "/mock/highway_002.jpg",
    status: "IN_PROGRESS",
    assignee: "Alex Kim",
    annotationCount: 5,
    createdAt: "2026-01-17",
  },
  {
    id: "t3",
    projectId: "p1",
    fileName: "parking_003.jpg",
    imageUrl: "/mock/parking_003.jpg",
    status: "TODO",
    assignee: "",
    annotationCount: 0,
    createdAt: "2026-01-18",
  },
  {
    id: "t4",
    projectId: "p1",
    fileName: "crosswalk_004.jpg",
    imageUrl: "/mock/crosswalk_004.jpg",
    status: "CONFIRMED",
    assignee: "Jamie L",
    annotationCount: 8,
    createdAt: "2026-01-19",
    confirmedBy: "Jamie L",
    confirmedAt: "2026-01-22",
  },
  {
    id: "t5",
    projectId: "p1",
    fileName: "downtown_005.jpg",
    imageUrl: "/mock/downtown_005.jpg",
    status: "IN_PROGRESS",
    assignee: "Sam R",
    annotationCount: 3,
    createdAt: "2026-01-20",
  },
  {
    id: "t6",
    projectId: "p1",
    fileName: "suburb_006.jpg",
    imageUrl: "/mock/suburb_006.jpg",
    status: "TODO",
    assignee: "",
    annotationCount: 0,
    createdAt: "2026-01-21",
  },
];

// Annotation points use normalized coordinates (0~1) relative to the image
export const MOCK_ANNOTATIONS: Annotation[] = [
  {
    id: "a1",
    taskId: "t1",
    label: "car",
    type: "bbox",
    points: [
      { x: 0.071, y: 0.222 },
      { x: 0.321, y: 0.222 },
      { x: 0.321, y: 0.556 },
      { x: 0.071, y: 0.556 },
    ],
    color: "#0D9488",
    createdBy: "Alex Kim",
  },
  {
    id: "a2",
    taskId: "t1",
    label: "person",
    type: "bbox",
    points: [
      { x: 0.464, y: 0.167 },
      { x: 0.571, y: 0.167 },
      { x: 0.571, y: 0.667 },
      { x: 0.464, y: 0.667 },
    ],
    color: "#3B82F6",
    createdBy: "Alex Kim",
  },
  {
    id: "a3",
    taskId: "t1",
    label: "bicycle",
    type: "polygon",
    points: [
      { x: 0.643, y: 0.444 },
      { x: 0.696, y: 0.361 },
      { x: 0.768, y: 0.444 },
      { x: 0.732, y: 0.611 },
      { x: 0.661, y: 0.611 },
    ],
    color: "#8B5CF6",
    createdBy: "Jamie L",
  },
  {
    id: "a4",
    taskId: "t2",
    label: "car",
    type: "bbox",
    points: [
      { x: 0.018, y: 0.306 },
      { x: 0.286, y: 0.306 },
      { x: 0.286, y: 0.667 },
      { x: 0.018, y: 0.667 },
    ],
    color: "#0D9488",
    createdBy: "Alex Kim",
  },
  {
    id: "a5",
    taskId: "t2",
    label: "car",
    type: "bbox",
    points: [
      { x: 0.554, y: 0.25 },
      { x: 0.786, y: 0.25 },
      { x: 0.786, y: 0.583 },
      { x: 0.554, y: 0.583 },
    ],
    color: "#0D9488",
    createdBy: "Alex Kim",
  },
];

export const MOCK_MODELS: ModelVersion[] = [
  {
    id: "m0",
    projectId: "p1",
    name: "YOLOv8n (Global Default)",
    baseModel: "YOLOv8n",
    status: "SUCCESS",
    isActive: false,
    isGlobalDefault: true,
    modelType: "base",
    mAP: null,
    trainedAt: "-",
    confirmedTasksUsed: 0,
  },
  {
    id: "m1",
    projectId: "p1",
    name: "YOLOv8n-traffic-v1",
    baseModel: "YOLOv8n",
    status: "SUCCESS",
    isActive: true,
    isGlobalDefault: false,
    modelType: "fine-tuned",
    mAP: 0.72,
    trainedAt: "2026-01-25",
    confirmedTasksUsed: 15,
  },
  {
    id: "m2",
    projectId: "p1",
    name: "YOLOv8n-traffic-v2",
    baseModel: "YOLOv8n",
    status: "SUCCESS",
    isActive: false,
    isGlobalDefault: false,
    modelType: "fine-tuned",
    mAP: 0.78,
    trainedAt: "2026-02-05",
    confirmedTasksUsed: 28,
  },
  {
    id: "m3",
    projectId: "p1",
    name: "YOLOv8s-traffic-v3",
    baseModel: "YOLOv8s",
    status: "RUNNING",
    isActive: false,
    isGlobalDefault: false,
    modelType: "fine-tuned",
    mAP: null,
    trainedAt: "2026-02-18",
    confirmedTasksUsed: 35,
  },
];

export const ONLINE_USERS = [
  { id: "u1", name: "Alex Kim", avatar: "AK", color: "#3B82F6" },
  { id: "u2", name: "Jamie L", avatar: "JL", color: "#0D9488" },
  { id: "u3", name: "Sam R", avatar: "SR", color: "#F59E0B" },
];

export const MOCK_MEMBERS: ProjectMember[] = [
  {
    id: "u1",
    name: "Alex Kim",
    email: "alex@labelforge.ai",
    role: "OWNER",
    joinedAt: "2026-01-15",
    avatar: "AK",
  },
  {
    id: "u2",
    name: "Jamie L",
    email: "jamie@labelforge.ai",
    role: "PARTICIPANT",
    joinedAt: "2026-01-16",
    avatar: "JL",
  },
  {
    id: "u3",
    name: "Sam R",
    email: "sam@labelforge.ai",
    role: "PARTICIPANT",
    joinedAt: "2026-01-18",
    avatar: "SR",
  },
  {
    id: "u4",
    name: "Jordan M",
    email: "jordan@labelforge.ai",
    role: "PARTICIPANT",
    joinedAt: "2026-01-20",
    avatar: "JM",
  },
];
