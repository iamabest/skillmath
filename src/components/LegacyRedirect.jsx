// import { useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';

// /**
//  * Handles legacy URL format: /?simulation=lop6-truc-so-nguyen
//  * Redirects to: /simulation/lop6-truc-so-nguyen
//  */
// export default function LegacyRedirect() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const slug = params.get('simulation');
//     if (slug) {
//       navigate(`/simulation/${slug}`, { replace: true });
//     } else {
//       navigate('/', { replace: true });
//     }
//   }, [navigate, location.search]);

//   return null;
// }
