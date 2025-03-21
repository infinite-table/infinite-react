export type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  lastModified?: string;
  owner?: string;
  permissions?: string;
  children?: FileSystemNode[];
};
export const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    sizeInKB: 1200,
    type: 'folder',
    children: [
      {
        id: '10',
        name: 'Private',
        sizeInKB: 100,
        type: 'folder',
        children: [
          {
            id: '100',
            name: 'Report.docx',
            sizeInKB: 210,
            type: 'file',
            extension: 'docx',
            mimeType: 'application/msword',
            lastModified: '2025-01-01',
            owner: 'Alice',
            permissions: 'rw-r--r--',
          },
          {
            id: '101',
            name: 'Vacation.docx',
            sizeInKB: 120,
            type: 'file',
            extension: 'docx',
            mimeType: 'application/msword',
            lastModified: '2025-01-02',
            owner: 'Bob',
            permissions: 'rw-r--r--',
          },
          {
            id: '102',
            name: 'CV.pdf',
            sizeInKB: 108,
            type: 'file',
            extension: 'pdf',
            mimeType: 'application/pdf',
            lastModified: '2025-01-03',
            owner: 'Charlie',
            permissions: 'r--r--r--',
          },
        ],
      },
      {
        id: '11',
        name: 'Work',
        sizeInKB: 800,
        type: 'folder',
        children: [
          {
            id: '110',
            name: 'ProjectPlan.xlsx',
            sizeInKB: 300,
            type: 'file',
            extension: 'xlsx',
            mimeType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            lastModified: '2025-01-04',
            owner: 'Alice',
            permissions: 'rw-rw-r--',
          },
          {
            id: '111',
            name: 'Presentation.pptx',
            sizeInKB: 500,
            type: 'file',
            extension: 'pptx',
            mimeType:
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            lastModified: '2025-01-05',
            owner: 'Bob',
            permissions: 'rw-r--r--',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    sizeInKB: 1000,
    type: 'folder',
    children: [
      {
        id: '20',
        name: 'unknown.txt',
        extension: 'txt',
        mimeType: 'text/plain',
        sizeInKB: 100,
        type: 'file',
        lastModified: '2025-01-06',
        owner: 'Alice',
        permissions: 'rw-------',
      },
      {
        id: '21',
        name: 'Notes',
        sizeInKB: 500,
        type: 'folder',
        children: [
          {
            id: '210',
            name: 'Ideas.txt',
            sizeInKB: 50,
            type: 'file',
            extension: 'txt',
            mimeType: 'text/plain',
            lastModified: '2025-01-07',
            owner: 'Bob',
            permissions: 'rw-r--r--',
          },
          {
            id: '211',
            name: 'Logbook.log',
            sizeInKB: 450,
            type: 'file',
            extension: 'log',
            mimeType: 'text/plain',
            lastModified: '2025-01-08',
            owner: 'Charlie',
            permissions: 'r--r--r--',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Media',
    sizeInKB: 1000,
    type: 'folder',
    children: [
      {
        id: '30',
        name: 'Music',
        sizeInKB: 3000,
        type: 'folder',
        children: [
          {
            id: '300',
            name: 'Jazz.mp3',
            sizeInKB: 500,
            type: 'file',
            extension: 'mp3',
            mimeType: 'audio/mpeg',
            lastModified: '2025-01-09',
            owner: 'Alice',
            permissions: 'rw-r--r--',
          },
          {
            id: '301',
            name: 'Rock.mp3',
            sizeInKB: 700,
            type: 'file',
            extension: 'mp3',
            mimeType: 'audio/mpeg',
            lastModified: '2025-01-10',
            owner: 'Bob',
            permissions: 'rw-------',
          },
        ],
      },
      {
        id: '31',
        name: 'Videos',
        sizeInKB: 5400,
        type: 'folder',
        children: [
          {
            id: '310',
            name: 'Vacation.mp4',
            sizeInKB: 108,
            type: 'file',
            extension: 'mp4',
            mimeType: 'video/mp4',
            lastModified: '2025-01-11',
            owner: 'Charlie',
            permissions: 'r--r--r--',
          },
          {
            id: '311',
            name: 'Tutorial.mov',
            sizeInKB: 2300,
            type: 'file',
            extension: 'mov',
            mimeType: 'video/quicktime',
            lastModified: '2025-01-12',
            owner: 'Alice',
            permissions: 'rw-rw-r--',
          },
        ],
      },
      {
        id: '32',
        name: 'Photos',
        sizeInKB: 1500,
        type: 'folder',
        children: [
          {
            id: '320',
            name: 'Family.jpg',
            sizeInKB: 450,
            type: 'file',
            extension: 'jpg',
            mimeType: 'image/jpeg',
            lastModified: '2025-01-13',
            owner: 'Bob',
            permissions: 'rw-r--r--',
          },
          {
            id: '321',
            name: 'Vacation.png',
            sizeInKB: 1050,
            type: 'file',
            extension: 'png',
            mimeType: 'image/png',
            lastModified: '2025-01-14',
            owner: 'Charlie',
            permissions: 'r--r--r--',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'Downloads',
    sizeInKB: 5000,
    type: 'folder',
    children: [
      {
        id: '40',
        name: 'Software',
        sizeInKB: 3500,
        type: 'folder',
        children: [
          {
            id: '400',
            name: 'Installer.exe',
            sizeInKB: 2500,
            type: 'file',
            extension: 'exe',
            mimeType: 'application/octet-stream',
            lastModified: '2025-01-15',
            owner: 'Alice',
            permissions: 'rw-------',
          },
          {
            id: '401',
            name: 'Setup.dmg',
            sizeInKB: 1000,
            type: 'file',
            extension: 'dmg',
            mimeType: 'application/x-apple-diskimage',
            lastModified: '2025-01-16',
            owner: 'Bob',
            permissions: 'rw-rw-r--',
          },
        ],
      },
      {
        id: '41',
        name: 'Books',
        sizeInKB: 1500,
        type: 'folder',
        children: [
          {
            id: '410',
            name: 'Fiction.epub',
            sizeInKB: 500,
            type: 'file',
            extension: 'epub',
            mimeType: 'application/epub+zip',
            lastModified: '2025-01-17',
            owner: 'Charlie',
            permissions: 'rw-------',
          },
          {
            id: '411',
            name: 'Manual.pdf',
            sizeInKB: 1000,
            type: 'file',
            extension: 'pdf',
            mimeType: 'application/pdf',
            lastModified: '2025-01-18',
            owner: 'Alice',
            permissions: 'r--r--r-- last',
          },
        ],
      },
    ],
  },
];
