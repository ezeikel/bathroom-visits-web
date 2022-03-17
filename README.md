## Notes

There are a few things I wasn't able to figure out:
- Regression line
  - I installed the 3rd party package `simple-statistics` and started using the linear regression functions from it but ran out of time to get this working correctly using the scales I had already defined. Could probably figure this out with some more time, but I think the issue with with the domain I had set up for the x axis not actually being a value that can be converted to a number.
- Displaying all 365 days of data
  - I spliced the array and only show 10 days so that the bars can be visible, otherwise there are too many bars and the labels are not visible. Did some reading about `d3.brush` which would allow panning the data, however didnt have the time to figure this out
- Tooltip
  - I found that the easiest way to do this would be to add a `Title` tag to the `rect` for each bar with the text for the tooltip but for a custom one it would basically need a element inside the rect that would be initally `visibility: hidden` and then with mouse over events to switch that on and off but didnt feel like I had enough time to figure this out
- General code quality things
  - Prettier
  - Linting
  - Tests
  - Commit hooks
  - More seperation of code
  
## Running locally

You can run the development server using:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app running.