import { Helmet } from 'react-helmet';

interface PageContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const PageContainer = ({ title, description, children }: PageContainerProps) => {
  return (
    <>
      <Helmet>
        <title>{title} | Daswos</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      {children}
    </>
  );
};

export default PageContainer;