export const IndexHeading = ({ id, title, category }: { id: string; title: string; category?: string }) => (
  <h1 className="index-heading" id={id}>
    {title}
    {category ? <> · {category}</> : null}
  </h1>
);
