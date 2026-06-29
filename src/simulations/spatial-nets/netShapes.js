const TAU = Math.PI * 2;

export const netShapeOptions = [
  {
    id: 'cube',
    name: 'Hình lập phương',
    kind: 'box',
    sides: 4,
    width: 2.4,
    depth: 2.4,
    height: 2.4,
    formula: 'S = 6a^2',
    note: 'Sáu mặt vuông bằng nhau, mở ra thành một lưới chữ thập.',
  },
  {
    id: 'cuboid',
    name: 'Hình hộp chữ nhật',
    kind: 'box',
    width: 3.2,
    depth: 2.1,
    height: 2.4,
    formula: 'S = 2(ab + bc + ca)',
    note: 'Các mặt đối diện bằng nhau, giúp so sánh ba cặp hình chữ nhật.',
  },
  {
    id: 'triangular-prism',
    name: 'Lăng trụ tam giác',
    kind: 'prism',
    sides: 3,
    radius: 1.6,
    height: 2.8,
    formula: 'Sxq = Cđáy · h',
    note: 'Ba mặt bên mở thành một dải hình chữ nhật, hai đáy là tam giác.',
  },

  {
    id: 'pentagonal-prism',
    name: 'Lăng trụ ngũ giác',
    kind: 'prism',
    sides: 5,
    radius: 1.45,
    height: 2.5,
    formula: 'Sxq = Cđáy · h',
    note: 'Dải mặt bên cho thấy chu vi đáy nhân với chiều cao.',
  },
  {
    id: 'hexagonal-prism',
    name: 'Lăng trụ lục giác',
    kind: 'prism',
    sides: 6,
    radius: 1.45,
    height: 2.4,
    formula: 'Sxq = Cđáy · h',
    note: 'Sáu hình chữ nhật mặt bên mở đều quanh đáy lục giác.',
  },
  {
    id: 'square-pyramid',
    name: 'Hình chóp tứ giác đều',
    kind: 'pyramid',
    sides: 4,
    radius: 1.7,
    height: 2.5,
    formula: 'S = Sđáy + Sxq',
    note: 'Bốn tam giác bên bung ra quanh đáy hình vuông.',
  },
  {
    id: 'triangular-pyramid',
    name: 'Hình chóp tam giác đều',
    kind: 'pyramid',
    sides: 3,
    radius: 1.65,
    height: 2.35,
    formula: 'S = Sđáy + Sxq',
    note: 'Mỗi cạnh đáy là bản lề của một tam giác bên.',
  },
];

export function buildNetShape(option) {
  if (option.kind === 'box') return buildBox(option);
  if (option.kind === 'pyramid') return buildPyramid(option);
  return buildPrism(option);
}

function buildBox(option) {
  const { width, depth, height } = option;
  const base = [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [width / 2, depth / 2],
    [-width / 2, depth / 2],
  ];

  return makePrismFaces(option, base, height);
}

function buildPrism(option) {
  const base = regularPolygon(option.sides, option.radius, -Math.PI / 2);
  return makePrismFaces(option, base, option.height);
}

function buildPyramid(option) {
  const base = regularPolygon(option.sides, option.radius, -Math.PI / 2);
  const center = centroid(base);
  const apexClosed = [center[0], option.height, center[1]];
  const faces = [
    {
      id: 'base',
      color: '#3b82f6',
      from: toFloorVertices(base),
      to: toFloorVertices(base),
    },
  ];

  edges(base).forEach(([a, b], index) => {
    const outward = outwardNormal(a, b);
    const mid = midpoint(a, b);
    const edgeLength = distance(a, b);
    const slant = Math.sqrt(option.height ** 2 + (edgeLength * 0.88) ** 2);
    const apexFlat = [
      mid[0] + outward[0] * slant,
      0,
      mid[1] + outward[1] * slant,
    ];

    faces.push({
      id: `side-${index}`,
      color: sideColor(index),
      from: [
        [a[0], 0, a[1]],
        [b[0], 0, b[1]],
        apexClosed,
      ],
      to: [
        [a[0], 0, a[1]],
        [b[0], 0, b[1]],
        apexFlat,
      ],
    });
  });

  return {
    ...option,
    camera: [5, 4.5, 6],
    faces,
  };
}

// function makePrismFaces(option, base, height) {
//   const faces = [
//     {
//       id: 'base-bottom',
//       color: '#3b82f6',
//       from: toFloorVertices(base),
//       to: toFloorVertices(base),
//     },
//   ];

//   edges(base).forEach(([a, b], index) => {
//     const outward = outwardNormal(a, b);
//     const flatA = [a[0] + outward[0] * height, 0, a[1] + outward[1] * height];
//     const flatB = [b[0] + outward[0] * height, 0, b[1] + outward[1] * height];

//     faces.push({
//       id: `side-${index}`,
//       color: sideColor(index),
//       from: [
//         [a[0], 0, a[1]],
//         [b[0], 0, b[1]],
//         [b[0], height, b[1]],
//         [a[0], height, a[1]],
//       ],
//       to: [
//         [a[0], 0, a[1]],
//         [b[0], 0, b[1]],
//         flatB,
//         flatA,
//       ],
//     });
//   });

//   const firstEdge = edges(base)[0];
//   const outward = outwardNormal(firstEdge[0], firstEdge[1]);
//   const topOffset = height * 1.15;
//   const topFlat = base.map(([x, z]) => [
//     x + outward[0] * topOffset,
//     z + outward[1] * topOffset,
//   ]);

//   faces.push({
//     id: 'base-top',
//     color: '#60a5fa',
//     from: base.map(([x, z]) => [x, height, z]),
//     to: toFloorVertices(topFlat),
//   });

//   return {
//     ...option,
//     camera: [5, 4.5, 6],
//     faces,
//   };
// }


function makePrismFaces(option, base, height) {
  const faces = [
    {
      id: 'base-bottom',
      color: '#3b82f6',
      from: toFloorVertices(base),
      to: toFloorVertices(base),
    },
  ];

  // 1. Tạo các mặt bên bọc xung quanh
  edges(base).forEach(([a, b], index) => {
    const outward = outwardNormal(a, b);
    const flatA = [a[0] + outward[0] * height, 0, a[1] + outward[1] * height];
    const flatB = [b[0] + outward[0] * height, 0, b[1] + outward[1] * height];

    faces.push({
      id: `side-${index}`,
      color: sideColor(index),
      from: [
        [a[0], 0, a[1]],
        [b[0], 0, b[1]],
        [b[0], height, b[1]],
        [a[0], height, a[1]],
      ],
      to: [
        [a[0], 0, a[1]],
        [b[0], 0, b[1]],
        flatB,
        flatA,
      ],
    });
  });

  // 2. TÍNH TOÁN CHÍNH XÁC MẶT TRÊN (base-top)
  // Chọn mặt bên cuối cùng (side-đoạn cuối) làm bản lề nối với mặt trên
  const lastIndex = base.length - 1;
  const lastEdge = edges(base)[lastIndex];
  const [edgeA, edgeB] = lastEdge; // Hai đỉnh chung tạo nên đường bản lề trong không gian 2D
  
  const outwardLast = outwardNormal(edgeA, edgeB);

  // Thuật toán: Đầu tiên lấy đối xứng qua trục bản lề ngoài (đã được đẩy ra một khoảng = height)
  // Việc này giúp mặt trên lật úp phẳng ra ngoài một cách chính xác mà không bị méo hình.
  const topFlat = base.map(([x, z]) => {
    // Tìm điểm hình chiếu của (x,z) lên đường thẳng chứa cạnh đáy cuối cùng
    const dx = edgeB[0] - edgeA[0];
    const dz = edgeB[1] - edgeA[1];
    const t = ((x - edgeA[0]) * dx + (z - edgeA[1]) * dz) / (dx * dx + dz * dz);
    
    const projX = edgeA[0] + t * dx;
    const projZ = edgeA[1] + t * dz;

    // Khoảng cách từ điểm gốc tới đường hình chiếu
    const distProjX = x - projX;
    const distProjZ = z - projZ;

    // Lật ngược điểm đó qua đường thẳng đáy, đồng thời đẩy ra thêm quãng đường bằng chiều cao mặt bên
    // Vị trí chuẩn xác 2D sau khi trải phẳng hoàn toàn
    return [
      projX - distProjX + outwardLast[0] * height,
      projZ - distProjZ + outwardLast[1] * height
    ];
  });

  faces.push({
    id: 'base-top',
    color: '#60a5fa',
    from: base.map(([x, z]) => [x, height, z]),
    to: toFloorVertices(topFlat),
  });

  return {
    ...option,
    camera: [5, 4.5, 6],
    faces,
  };
}


function regularPolygon(sides, radius, startAngle = 0) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = startAngle + (index * TAU) / sides;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  });
}

function edges(points) {
  return points.map((point, index) => [point, points[(index + 1) % points.length]]);
}

function toFloorVertices(points) {
  return points.map(([x, z]) => [x, 0, z]);
}

function outwardNormal(a, b) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const length = Math.hypot(dx, dz) || 1;
  return [dz / length, -dx / length];
}

function midpoint(a, b) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function centroid(points) {
  const total = points.reduce(
    (acc, point) => [acc[0] + point[0], acc[1] + point[1]],
    [0, 0],
  );
  return [total[0] / points.length, total[1] / points.length];
}

function distance(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function sideColor(index) {
  const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6', '#a855f7'];
  return colors[index % colors.length];
}
