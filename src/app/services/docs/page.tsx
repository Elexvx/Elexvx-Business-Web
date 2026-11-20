import { permanentRedirect } from 'next/navigation';

import { documentationUrl } from '../../../data/service-routes';

export default function Page() {
  permanentRedirect(documentationUrl);
}
