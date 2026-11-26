export type LayoutOrientation = "portrait" | "landscape";
export type PhotoShape = "round" | "square" | "custom";
export type ApplicableUserType = "Student" | "Staff" | "Teacher" | "Employee" | "Visitor";

export interface LayoutSpacing {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface CardFieldsConfig {
    admissionNo: boolean;
    name: boolean;
    class: boolean;
    fatherName: boolean;
    motherName: boolean;
    address: boolean;
    dob: boolean;
    bloodGroup: boolean;
    phone: boolean;
    idNo: boolean;
    qrCode: boolean;
}

export interface ElementPosition {
    x: number;
    y: number;
}

export interface PhotoRadiusConfig {
    topLeft: number; // in px or %
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
    isLinked: boolean;
}

export interface TextColorsConfig {
    primaryText: string;     // Student/Cardholder Name (default "#12255d")
    labelColor: string;      // Field labels e.g. Parentage, Address (default "#2b3658")
    valueColor: string;      // Field values text (default "#1f2937")
    headerTextColor: string; // Header banner & School Name text (default "#ffffff")
}

export interface ElementPositionsConfig {
    photo?: ElementPosition;
    name?: ElementPosition;
    fatherName?: ElementPosition;
    motherName?: ElementPosition;
    class?: ElementPosition;
    address?: ElementPosition;
    dob?: ElementPosition;
    bloodGroup?: ElementPosition;
    phone?: ElementPosition;
    idNo?: ElementPosition;
    admissionNo?: ElementPosition;
    qrCode?: ElementPosition;
    logo?: ElementPosition;
    signature?: ElementPosition;
    detailsBlock?: ElementPosition;
}

export interface IDCardConfig {
    id?: string;
    title: string;
    layout: LayoutOrientation;
    bgImage: string | null;
    applicableUser: ApplicableUserType;
    pageWidth: number; // in mm
    pageHeight: number; // in mm
    photoStyle: PhotoShape;
    userPhotoWidth: number; // in mm
    userPhotoHeight: number; // in mm
    photoRadius: PhotoRadiusConfig;
    textColors: TextColorsConfig;
    elementColors?: Record<string, string>;
    spacing: LayoutSpacing;
    logo: string | null;
    signature: string | null;
    schoolName: string;
    schoolSubtitle: string;
    fields: CardFieldsConfig;
    elementPositions: ElementPositionsConfig;
}

export interface SampleProfile {
    id: string;
    role: ApplicableUserType;
    name: string;
    fatherName: string;
    motherName: string;
    admissionNo: string;
    className: string;
    section: string;
    address: string;
    phone: string;
    idNo: string;
    dob: string;
    bloodGroup: string;
    photoUrl: string;
    emergencyContact: string;
    academicYear: string;
}

export const DEFAULT_ID_CONFIG: IDCardConfig = {
    title: "Student ID Card",
    layout: "portrait",
    bgImage: null,
    applicableUser: "Student",
    pageWidth: 57,
    pageHeight: 89,
    photoStyle: "round",
    userPhotoWidth: 21,
    userPhotoHeight: 21,
    photoRadius: {
        topLeft: 50,
        topRight: 50,
        bottomRight: 50,
        bottomLeft: 50,
        isLinked: true,
    },
    textColors: {
        primaryText: "#12255d",
        labelColor: "#2b3658",
        valueColor: "#1f2937",
        headerTextColor: "#ffffff",
    },
    elementColors: {},
    spacing: {
        top: 2.5,
        bottom: 2.5,
        left: 3,
        right: 3,
    },
    logo: "/YES_india_logo.png",
    signature: null,
    schoolName: "RAZA UL ULOOM ISLAMIA HIGHER SECONDARY SCHOOL",
    schoolSubtitle: "Near Panchayat Ghar Kanliyan Pin: 193103 Phone: 01954-222345",
    fields: {
        admissionNo: false,
        name: true,
        class: false,
        fatherName: true,
        motherName: false,
        address: false,
        dob: true,
        bloodGroup: false,
        phone: true,
        idNo: true,
        qrCode: false,
    },
    elementPositions: {},
};

export const SAMPLE_PROFILES: SampleProfile[] = [
    {
        id: "1",
        role: "Student",
        name: "AFTAB AHMED",
        fatherName: "AKHLAQ AHMED",
        motherName: "SURAIYA BEGUM",
        admissionNo: "1042",
        className: "9TH",
        section: "A 3",
        address: "KANLIYAN",
        phone: "9797400794",
        idNo: "RU84550536",
        dob: "14-06-2009",
        bloodGroup: "O+",
        photoUrl: "/Rectangle 17.png",
        emergencyContact: "9797400794",
        academicYear: "2025 - 2026",
    },
    {
        id: "2",
        role: "Student",
        name: "FATIMA ZAHRA",
        fatherName: "MOHAMMAD ZAHRA",
        motherName: "NAZIA BANO",
        admissionNo: "1088",
        className: "10TH",
        section: "B 1",
        address: "BARAMULLA",
        phone: "9419123456",
        idNo: "RU84550588",
        dob: "22-09-2008",
        bloodGroup: "B+",
        photoUrl: "/Rectangle 17.png",
        emergencyContact: "9419123456",
        academicYear: "2025 - 2026",
    },
    {
        id: "3",
        role: "Staff",
        name: "DR. TARIQ AHMAD",
        fatherName: "GHULAM RASOOL",
        motherName: "HAMEEDA BANO",
        admissionNo: "EMP-204",
        className: "Faculty",
        section: "Science Dept",
        address: "SRINAGAR",
        phone: "9858001122",
        idNo: "YES-EMP-092",
        dob: "05-04-1988",
        bloodGroup: "A+",
        photoUrl: "/teacher.png",
        emergencyContact: "9858001122",
        academicYear: "2025 - 2026",
    },
];
