const { page, ...passProps } = props;

const { AppLayout } = VM.require(
  "/*__@appAccount__*//widget/components.Layout"
);

if (!AppLayout) {
  return <p>Loading modules...</p>;
}

// CSS styles to be used across the app.
// Define fonts here, as well as any other global styles.
const Theme = styled.div`
  a {
    color: inherit;
  }
  
  width: 100%;
  height: 100vh;
`;

if (!page) {
  // If no page is specified, we default to the feed page TEMP
  page = "dashboard";
}

// This is our navigation, rendering the page based on the page parameter
function Page() {
  const routes = page.split(".");
  switch (routes[0]) {
    case "dashboard": {
      return (
        <Widget
          src="/*__@appAccount__*//widget/pages.Dashboard"
          props={passProps}
        />
      );
    }
    case "explore": {
      return (
        <Widget
          src="/*__@appAccount__*//widget/pages.Explore"
          props={passProps}
        />
      );
    }
    case "create": {
      return (
        <Widget
          src="/*__@appAccount__*//widget/pages.Create"
          props={passProps}
        />
      );
    }
    default: {
      // TODO: 404 page
      return <p>404</p>;
    }
  }
}

return (
  <Theme>
    <AppLayout page={page}>
      <Page />
    </AppLayout>
  </Theme>
);