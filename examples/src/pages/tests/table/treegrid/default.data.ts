export type FileSystemNode = {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[] | null;
  sizeKB?: number;
  id: string;
  collapsed?: boolean;
};

export const nodes: FileSystemNode[] = [
  {
    name: 'Documents',
    type: 'folder',
    id: '1',
    children: [
      { name: 'timetable.xls', type: 'file', sizeKB: 10, id: '2' },
      {
        name: 'report.doc',
        type: 'file',
        sizeKB: 100,
        id: '3',
      },
      {
        type: 'folder',
        name: 'pictures',
        id: '4',
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '5',
          },
          {
            name: 'mountain.jpg',
            type: 'file',
            sizeKB: 302,
            id: '6',
          },
        ],
      },
      {
        type: 'file',
        name: 'last.txt',
        id: '7',
      },
    ],
  },
  {
    type: 'folder',
    name: 'Downloads',
    id: '8',
    collapsed: true,
    children: [
      {
        name: 'resume.doc',
        type: 'file',
        sizeKB: 5034,
        id: '9',
      },
      {
        name: 'report.pdf',
        type: 'file',
        sizeKB: 1000,
        id: '10',
      },
    ],
  },
];
