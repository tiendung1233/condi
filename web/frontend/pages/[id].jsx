import { useNavigate, useParams } from 'react-router-dom';
import TextEditor from './TextEditor';
import './main.css';
import {
  Page,
  Card,
  Grid,
  FormLayout,
  TextField,
  ChoiceList,
  Button,
  Stack,
  Icon,
  OptionList,
  DatePicker,
  Scrollable,
  TextContainer,
  Select,
  PageActions,
  Modal,
  Frame,
  ContextualSaveBar,
  Toast,
} from '@shopify/polaris';

import { CalendarMinor, ClockMajor } from '@shopify/polaris-icons';
import React from 'react';
import { useState, useCallback, useReducer, useEffect } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
function updatePage() {
  const fetchAPI = useAuthenticatedFetch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState();
  const [htmlInput, setHtmlInput] = useState();
  const [activeModale, setActiveModle] = useState(false);
  const [title, setTitle] = useState();
  const [handle, setHandle] = useState();
  const [dates, setDates] = useState(true);
  const [selected, setSelected] = useState(['visible']);
  const [selecTime, setSelecTime] = useState([]);
  const [checkDate, setCheckDate] = useState(false);
  const [checkTime, setCheckTime] = useState(false);
  const [checkActionSe, setCheckActionSeo] = useState(false);
  const [checkIsPublished, setCheckIsPublished] = useState();
  const [titlePage, setTitlePage] = useState();
  const [description, setDescription] = useState('');
  const [checkHeader, setCheckHeader] = useState('none');
  const [active, setActive] = useState(false);
  const [url, setUrl] = useState('');
  const [selectTemplate, setSelectTemplate] = useState('');
  const [message, setMessage] = useState('');

  const date = new Date();
  const handleSelectChange = useCallback(
    (value) => setSelectTemplate(value),
    []
  );

  const toggleActive = () => {
    updatePage();
    setCheckHeader('none');
    setActive((active) => !active);
  };
  const toastMarkup = active ? (
    <Toast content="Page was saved" onDismiss={toggleActive} />
  ) : null;

  const [getDate, setGetDate] = useState(8);
  const handleChange = (value) => {
    setSelected(value);
    if (value == 'hidden') {
      setCheckIsPublished((preState) => {
        setCheckHeader('block');
        return false;
      });
    } else {
      setCheckIsPublished((preState) => {
        setCheckHeader('block');
        return true;
      });
    }
  };
  const handleChangeModel = useCallback(
    () => setActiveModle(!activeModale),
    [activeModale]
  );

  const [{ month, year }, setDate] = useState({
    month: 8,
    year: 2022,
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(),
    end: new Date(),
  });

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  const handleSetDate = () => {
    setDates(false), setSelected('Hidden');
  };
  const handleCleardate = () => {
    setDates(true);
  };

  const handleHtmlInput = (data) => {
    setHtmlInput(data);
  };
  const options = [
    { label: 'Default page', value: '' },

    { label: 'contact', value: 'contact' },
  ];

  const actionsSeo = () => {
    if (checkActionSe === false) {
      setCheckActionSeo(true);
    } else {
      setCheckActionSeo(false);
    }
  };
  useEffect(() => {
    fetchAPI(`/api/get/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setPage(data);
        setUrl(data.handle);
        setCheckIsPublished(data.published);
      });
  }, []);

  const updatePage = () => {
    fetchAPI(`/api/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        title: title,
        body: message,
        published: checkIsPublished,
        handle: url.split(' ').join('_'),
        id: id,
        template_suffix: selectTemplate,
      }),
    });
  };
  const callbackFunction = (childData) => {
    setMessage(childData);
  };
  return (
    <>
      <div style={{ height: '46px', display: `${checkHeader}` }}>
        <Frame
          logo={{
            width: 124,
            contextualSaveBarSource:
              'https://cdn.shopify.com/shopifycloud/web/assets/v1/f5416ec27e17f00a67f8c2d6603088baa6635c7bc2071b4f6533c8d260fc8644.svg',
          }}
        >
          <ContextualSaveBar
            message="Unsaved changes"
            saveAction={{
              onAction: toggleActive,
              loading: false,
              disabled: false,
            }}
            discardAction={{
              onAction: () => console.log('add clear form logic'),
            }}
          />
          {toastMarkup}
        </Frame>
      </div>
      {activeModale === true && (
        <div style={{ height: '500px' }}>
          <Modal
            // activator={activator}
            open={activeModale}
            onClose={handleChangeModel}
            title="You have unsaved changes"
            primaryAction={{
              content: 'Leave Page',
              destructive: true,

              onAction: () => {
                navigate('/');
              },
            }}
            secondaryActions={[
              {
                content: 'Cancel',
                onAction: () => {
                  setActiveModle(false);
                },
              },
            ]}
          >
            <Modal.Section>
              <TextContainer>
                <p>
                  If you leave this page, all unsaved changes will be
                  lost.
                </p>
              </TextContainer>
            </Modal.Section>
          </Modal>
        </div>
      )}

      <Page
        breadcrumbs={[
          {
            content: 'Settings',
            onAction: () => {
              setActiveModle(true);
            },
          },
        ]}
        title="General"
      ></Page>
      <Page>
        <Grid>
          <Grid.Cell
            columnSpan={{ xs: 8, sm: 3, md: 3, lg: 8, xl: 8 }}
          >
            <Card>
              <Card sectioned>
                <FormLayout>
                  <TextField
                    label="Title"
                    placeholder="e.g Contact us, Sizing chart, FAQs "
                    value={title}
                    onChange={(e) => {
                      setCheckHeader('block');
                      setTitle(e);
                    }}
                    autoComplete="off"
                  />
                </FormLayout>
                <div>Content</div>
                <TextEditor
                  parentCallback={setMessage}
                  bodyHtml={id}
                />
              </Card>
              <Card
                sectioned
                title="Search engine listing preview"
                actions={[
                  {
                    content: 'Edit website SEO',
                    onAction: actionsSeo,
                  },
                ]}
              >
                {checkActionSe === false && (
                  <>
                    <p>
                      Add a title and description to see how this Page
                      might appear in a search engine listing
                    </p>
                    <p className="rUXT">{title}</p>
                    {title !== undefined && (
                      <p className="XNE1s">
                        {` https://dungprovip.myshopify.com/pages/${url
                          .split(' ')
                          .join('_')} `}
                      </p>
                    )}
                    <p>{description}</p>
                  </>
                )}
                {checkActionSe === true && (
                  <>
                    <p className="rUXT">{titlePage || title}</p>
                    <p className="XNE1s">
                      {` https://dungprovip.myshopify.com/pages/${url
                        .split(' ')
                        .join('_')} `}
                    </p>
                    <p>{description}</p>
                  </>
                )}
              </Card>
              {checkActionSe === true && (
                <div>
                  <Card sectioned>
                    <FormLayout>
                      <TextField
                        label="Page title"
                        value={titlePage}
                        defaultValue={title}
                        onChange={(e) => {
                          setTitlePage(e);
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => {
                          setDescription(e);
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        label="URL and handle"
                        value={url}
                        defaultValue={handle}
                        onChange={(e) => {
                          setUrl(e);
                        }}
                        autoComplete="off"
                      />
                    </FormLayout>
                  </Card>
                </div>
              )}
            </Card>
          </Grid.Cell>
          <Grid.Cell
            columnSpan={{ xs: 4, sm: 3, md: 3, lg: 4, xl: 4 }}
          >
            <Card title="Visibility" sectioned>
              <ChoiceList
                choices={[
                  { label: 'Visible', value: 'visible' },
                  { label: 'Hidden', value: 'hidden' },
                ]}
                selected={selected}
                onChange={handleChange}
              />
              {dates === true && (
                <Button plain onClick={handleSetDate}>
                  Set visibility date
                </Button>
              )}
              {dates === false && (
                <>
                  <Stack distribution="fillEvenly">
                    <div> Visibility date</div>

                    <TextField
                      value={`${month}/${getDate}/${year}`}
                      prefix={
                        <Icon source={CalendarMinor} color="base" />
                      }
                      autoComplete="off"
                      onFocus={() => setCheckDate(true)}
                    />
                    {checkDate === true && (
                      <DatePicker
                        month={month}
                        year={year}
                        onChange={(e) => {
                          setSelectedDates,
                            setCheckDate(false),
                            setGetDate(e.start.getDate());
                        }}
                        onMonthChange={handleMonthChange}
                        selected={selectedDates}
                      />
                    )}
                    <TextField
                      value={selecTime}
                      prefix={
                        <Icon source={ClockMajor} color="base" />
                      }
                      autoComplete="off"
                      onFocus={() => setCheckTime(true)}
                    />
                    {checkTime === true && (
                      <Scrollable
                        shadow
                        style={{ height: '250px' }}
                        focusable
                      >
                        <OptionList
                          title="Inventory Location"
                          onChange={(e) => {
                            setSelecTime(e);
                            setCheckTime(false);
                          }}
                          options={[
                            { value: '12:00 AM', label: '12:00 AM' },
                            { value: '1:00 AM', label: '1:00 AM' },
                            { value: '2:00 AM', label: '2:00 AM' },
                            { value: '3:00 AM', label: '3:00 AM' },
                            { value: '4:00 AM', label: '4:00 AM' },
                            { value: '5:00 AM', label: '5:00 AM ' },
                            { value: '6:00 AM', label: '6:00 AM' },
                            { value: '7:00 AM', label: '7:00 AM' },
                            { value: '8:00 AM', label: '8:00 AM' },
                            { value: '9:00 AM', label: '9:00 AM' },
                            { value: '10:00 AM', label: '10:00 AM' },
                            { value: '11:00 AM', label: '11:00 AM' },
                            { value: '12:00 PM', label: '12:00 PM' },
                            { value: '1:00 PM', label: '1:00 PM' },
                            { value: '2:00 PM', label: '2:00 PM' },
                            { value: '3:00 PM', label: '3:00 PM' },
                            { value: '4:00 PM', label: '4:00 PM' },
                            { value: '5:00 PM', label: '5:00 PM ' },
                            { value: '6:00 PM', label: '6:00 PM' },
                            { value: '7:00 PM', label: '7:00 PM' },
                            { value: '8:00 PM', label: '8:00 PM' },
                            { value: '9:00 PM', label: '9:00 PM' },
                            { value: '10:00 AM', label: '10:00 AM' },
                            { value: '11:00 PM', label: '11:00 PM' },
                          ]}
                          selected={selecTime}
                        />
                      </Scrollable>
                    )}
                  </Stack>
                  <Button plain onClick={handleCleardate}>
                    Clear date...
                  </Button>
                </>
              )}
            </Card>
            <Card title="Online Store" sectioned>
              <TextContainer>
                <Select
                  label="Theme template"
                  options={options}
                  onChange={handleSelectChange}
                  value={selectTemplate}
                />
                <p>
                  Assign a template from your current theme to define
                  how the page is displayed.
                </p>
              </TextContainer>
            </Card>
          </Grid.Cell>
        </Grid>
        <PageActions
          primaryAction={{
            content: 'Save',
            onAction: () => {
              toggleActive();
              // .then(navigate('/'))
              callbackFunction();
            },
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => {
                setActiveModle(true);
              },
            },
          ]}
        />
      </Page>
    </>
  );
}
export default updatePage;
