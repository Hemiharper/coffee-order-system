<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Barista View</title><link href="/index.css" rel="stylesheet" /></head>
<body class="bg-blue-600">
  <div id="root"></div>
  <script type="module">
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import CoffeeOrderSystem from '/src/components/CoffeeOrderSystem.jsx';
    // Force barista-only mode
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <CoffeeOrderSystem baristaMode />
      </React.StrictMode>
    );
  </script>
</body>
</html>
