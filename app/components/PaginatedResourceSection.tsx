import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {useSearchParams, useLocation} from 'react-router';

/**
 * <PaginatedResourceSection> is a component that handles pagination in two modes:
 * - 'pagination': Traditional page-based navigation with ?page=X URLs
 * - 'load-more': Ajax-based "Load more" button that appends products
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
  mode = 'load-more',
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
  mode?: 'pagination' | 'load-more';
}) {
  // For 'load-more' mode: use Shopify's Pagination (Ajax-based)
  if (mode === 'load-more') {
    return (
      <Pagination connection={connection}>
        {({nodes, isLoading, NextLink, hasNextPage}) => (
          <div>
            <div className={resourcesClassName}>
              {nodes.map((node, index) => children({node, index}))}
            </div>
            {hasNextPage && (
              <div className="load-more-container">
                <NextLink className="load-more-btn">
                  {isLoading ? 'Loading...' : 'Load more products'}
                </NextLink>
              </div>
            )}
          </div>
        )}
      </Pagination>
    );
  }

  // For 'pagination' mode: use custom Link-based navigation with ?page=X
  return (
    <PageBasedPagination
      connection={connection}
      resourcesClassName={resourcesClassName}
    >
      {children}
    </PageBasedPagination>
  );
}

interface PageBasedPaginationProps<NodesType> {
  connection: {
    nodes: NodesType[];
    pageInfo: {
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}

function PageBasedPagination<NodesType>({
  connection,
  children,
  resourcesClassName,
}: PageBasedPaginationProps<NodesType>) {
  const [searchParams] = useSearchParams();
  const {pathname} = useLocation();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const {nodes, pageInfo} = connection;
  const {hasPreviousPage, hasNextPage} = pageInfo;

  // Generate URL for a specific page, preserving other query params (filters, sort)
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    // Add timestamp to bust browser cache and force fresh server request
    params.set('_t', Date.now().toString());
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const resourcesMarkup = nodes.map((node, index) => children({node, index}));

  // If only one page, just show products without pagination
  if (!hasPreviousPage && !hasNextPage) {
    return (
      <div className={resourcesClassName}>
        {resourcesMarkup}
      </div>
    );
  }

  return (
    <div>
      {resourcesClassName ? (
        <div className={resourcesClassName}>{resourcesMarkup}</div>
      ) : (
        resourcesMarkup
      )}
      <nav className="pagination" aria-label="Pagination">
        {/* Previous arrow - only if not on page 1 */}
        {currentPage > 1 && (
          <PaginationLink
            to={getPageUrl(currentPage - 1)}
            className="pagination__btn pagination__btn--arrow"
          >
            <PrevArrowIcon />
          </PaginationLink>
        )}

        <div className="pagination__pages">
          {/* Always show page 1 */}
          {currentPage === 1 ? (
            <span className="pagination__btn pagination__btn--active">1</span>
          ) : (
            <PaginationLink
              to={getPageUrl(1)}
              className="pagination__btn"
            >
              1
            </PaginationLink>
          )}

          {/* Show ellipsis if current page > 3 */}
          {currentPage > 3 && (
            <span className="pagination__btn pagination__btn--disabled">...</span>
          )}

          {/* Show page before current (if > 2) */}
          {currentPage > 2 && (
            <PaginationLink
              to={getPageUrl(currentPage - 1)}
              className="pagination__btn"
            >
              {currentPage - 1}
            </PaginationLink>
          )}

          {/* Current page (if not page 1) */}
          {currentPage !== 1 && (
            <span className="pagination__btn pagination__btn--active">
              {currentPage}
            </span>
          )}

          {/* Next page */}
          {hasNextPage && (
            <PaginationLink
              to={getPageUrl(currentPage + 1)}
              className="pagination__btn"
            >
              {currentPage + 1}
            </PaginationLink>
          )}
        </div>

        {/* Next arrow */}
        {hasNextPage && (
          <PaginationLink
            to={getPageUrl(currentPage + 1)}
            className="pagination__btn pagination__btn--arrow"
          >
            <NextArrowIcon />
          </PaginationLink>
        )}
      </nav>
    </div>
  );
}

function PaginationLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  // Use data-discover="false" to prevent React Router from intercepting this link
  // This forces a full page reload, ensuring the loader runs with fresh data
  return (
    <a
      href={to}
      className={className}
      data-discover="false"
    >
      {children}
    </a>
  );
}

function PrevArrowIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function NextArrowIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
