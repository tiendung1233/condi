import {
  Card,
  Page,
  Layout,
  Tabs,
  ResourceList,
  ResourceItem,
  TextStyle,
  TextField,
  Filters,
  Button,
  Avatar,
  ChoiceList,
  DataTable,
  Popover,
  ActionList,
  Stack,
  Badge,
} from '@shopify/polaris';
import { TitleBar, useNavigate } from '@shopify/app-bridge-react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useState, useCallback, useEffect } from 'react';
export default function HomePage() {
  const [availability, setAvailability] = useState(null);
  const [productType, setProductType] = useState(null);
  const [taggedWith, setTaggedWith] = useState(null);
  const [queryValue, setQueryValue] = useState('');
  const [sort, setSort] = useState(null);
  const fetchAPI = useAuthenticatedFetch();
  const [selected, setSelected] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkDelete, setCheckDelete] = useState(false);
  const [listItem, setListItem] = useState();
  const [itemSort, setItemSort] = useState([]);
  const [checkHV, setCheckHV] = useState(false);
  const [visit, setVisit] = useState(['newdate']);

  const [dataPage, setDataPage] = useState();
  const resourceName = {
    singular: 'customer',
    plural: 'customers',
  };

  const [active, setActive] = useState(true);

  const toggleActive = useCallback(
    () => setActive((active) => !active),
    []
  );

  const activator = (
    <Button onClick={toggleActive} disclosure>
      More actions
    </Button>
  );
  const handleAvailabilityChange = (value) => {
    setAvailability(value);
  };
  const handleProductTypeChange = useCallback(
    (value) => setProductType(value),
    []
  );
  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    []
  );
  const handleFiltersQueryChange = (value) => {
    setQueryValue(value);
  };

  const handleAvailabilityRemove = () => {
    setAvailability(null);
  };

  const handleProductTypeRemove = () => {
    setProductType(null);
  };

  const handleTaggedWithRemove = () => {
    setTaggedWith(null);
  };

  const handleQueryValueRemove = () => {
    setQueryValue('');
  };
  const handleFiltersClearAll = useCallback(() => {
    handleAvailabilityRemove();
    handleProductTypeRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAvailabilityRemove,
    handleQueryValueRemove,
    handleProductTypeRemove,
    handleTaggedWithRemove,
  ]);
  const filters = [
    {
      key: 'availability',
      label: 'Visible',
      filter: (
        <ChoiceList
          title="Visible"
          titleHidden
          choices={[
            { label: 'Visible', value: 'Visible' },
            { label: 'Hidden', value: 'Hidden' },
          ]}
          selected={availability || []}
          onChange={handleAvailabilityChange}
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (!isEmpty(availability)) {
    const key = 'availability';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, availability),
      onRemove: handleAvailabilityRemove,
    });
  }
  if (!isEmpty(productType)) {
    const key = 'productType';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, productType),
      onRemove: handleProductTypeRemove,
    });
  }
  if (!isEmpty(taggedWith)) {
    const key = 'taggedWith';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, taggedWith),
      onRemove: handleTaggedWithRemove,
    });
  }
  const items = [{}];
  // /////////////  delete Item
  const bulkActions = [
    {
      content: 'Make selected pages visible',
      onAction: async () => {
        setSelectedItems([]);
        const unresolved = selectedItems.map(async (item) => {
          await fetchAPI(`/api/update/${item}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              id: item,
              published: true,
            }),
          });
        });
        await Promise.all(unresolved);
        callApi();
        setVisit('AZ');
      },
    },
    {
      content: 'Hide selected pages',
      onAction: () => {
        setSelectedItems([]);
        const unresolved = selectedItems.map((item) => {
          fetchAPI(`/api/update/${item}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              id: item,
              published: false,
            }),
          });
        });
        Promise.all(unresolved);
        callApi();
        setVisit('AZ');
      },
    },
    {
      content: 'Delete pages',
      onAction: () => {
        selectedItems.map((id) => {
          fetchAPI(`/api/delete/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          })
            .then(setTimeout(callApi, 500))
            .then(setSelectedItems([]));
        });
      },
      destructive: true,
    },
  ];

  function resolveItemIds({ id }) {
    return id;
  }

  /////////////////////////////// renderItem and Sort
  let itemFilter = itemSort?.filter(
    (item, index) =>
      queryValue === item.title.substring(0, queryValue.length) &&
      (availability === null ||
        (availability[0] === 'Hidden' &&
          item.published_at === null) ||
        (availability[0] === 'Visible' && item.published_at !== null))
  );

  const handleVisit = (value) => {
    setVisit(value);
    console.log(visit);
    if (visit[0] === 'ZA') {
      setItemSort(
        itemSort.sort((a, b) => a.title.localeCompare(b.title))
      );
    }
    if (visit[0] === 'AZ') {
      setItemSort(
        itemSort.sort((a, b) => b.title.localeCompare(a.title))
      );
    }
    if (visit[0] === 'olddate') {
      setItemSort(
        itemSort.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        )
      );
    }
    if (visit[0] === 'newdate') {
      setItemSort(
        itemSort.sort(
          (a, b) => new Date(a.updated_at) - new Date(b.updated_at)
        )
      );
    }
  };
  function renderItem(item, _, index) {
    const { id, title, handle, published_at, body, updated_at } =
      item;
    const hidden = [
      {
        content: 'Preview page',
        onAction: () => {
          window.open(
            `https://dungprovip.myshopify.com/pages/${handle}`
          );
        },
      },
    ];
    const visible = [
      {
        content: 'View page',
        onAction: () => {
          window.open(
            `https://dungprovip.myshopify.com/pages/${handle}`
          );
        },
      },
    ];

    return (
      <ResourceItem
        shortcutActions={published_at === null ? hidden : visible}
        onClick={() => navigate(`/${id}`)}
        id={id}
        sortOrder={index}
        accessibilityLabel={`View details for ${title}`}
      >
        <h3>
          <Stack>
            <TextStyle variation="strong">{title}</TextStyle>
            {published_at === null && <Badge>Hidden</Badge>}
          </Stack>
        </h3>

        <div>{body.replace(/<[^>]+>/g, '')}</div>
        <div>{new Date(updated_at).toLocaleString('en-US')}</div>
      </ResourceItem>
    );
  }
  /////////////////////////////// renderItem and Sort
  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );
  const tabs = [
    {
      id: 'all-customers-1',
      content: 'All',
      accessibilityLabel: 'All customers',
      panelID: 'all-customers-content-1',
    },
  ];
  const navigate = useNavigate();
  const addPage = () => {
    navigate('/new');
  };
  const callApi = () => {
    fetchAPI('/api/get/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setItemSort(
          data.map((item) => ({
            id: item.id,
            title: item.title,
            handle: item.handle,
            published_at: item.published_at,
            body: item.body_html,
            updated_at: item.updated_at,
          }))
        );
        setDataPage(data);
      });
  };

  useEffect(() => {
    callApi();
  }, [checkDelete, checkHV]);
  useEffect(() => {
    itemFilter = listItem?.filter(
      (item) =>
        queryValue === item.title.substring(0, queryValue.length)
    );
  });
  function disambiguateLabel(key, value) {
    switch (key) {
      case 'taggedWith':
        return `Tagged with ${value}`;
      case 'availability':
        return value.map((val) => `Available on ${val}`).join(', ');
      case 'productType':
        return value.join(', ');
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === '' || value == null;
    }
  }
  return (
    <>
      <Page
        fullWidth
        title="Page"
        primaryAction={{
          content: 'Add pages',
          onAction: () => addPage(),
        }}
      />

      <Page fullWidth>
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs
                tabs={tabs}
                selected={selected}
                onSelect={handleTabChange}
              >
                <div>
                  <Card>
                    <Card.Section>
                      <Filters
                        queryValue={queryValue}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onQueryChange={handleFiltersQueryChange}
                        onQueryClear={handleQueryValueRemove}
                        onClearAll={handleFiltersClearAll}
                      >
                        <div>
                          <Popover
                            active={active}
                            activator={activator}
                            autofocusTarget="first-node"
                            onClose={toggleActive}
                          >
                            <Card>
                              <Card.Section>
                                <ChoiceList
                                  choices={[
                                    {
                                      label: 'Newest update',
                                      value: 'newdate',
                                    },
                                    {
                                      label: 'Oldest update',
                                      value: 'olddate',
                                    },
                                    {
                                      label: 'Title A–Z',
                                      value: 'AZ',
                                    },
                                    {
                                      label: 'Title Z–A',
                                      value: 'ZA',
                                    },
                                  ]}
                                  selected={visit}
                                  onChange={handleVisit}
                                />
                              </Card.Section>
                            </Card>
                          </Popover>
                        </div>
                      </Filters>
                    </Card.Section>
                  </Card>
                </div>
                <Card>
                  <ResourceList
                    resourceName={resourceName}
                    items={itemFilter ? itemFilter : items}
                    renderItem={renderItem}
                    selectedItems={selectedItems}
                    onSelectionChange={setSelectedItems}
                    bulkActions={bulkActions}
                    sortValue={122}
                    loading={itemSort ? false : true}
                  />
                </Card>
              </Tabs>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}
